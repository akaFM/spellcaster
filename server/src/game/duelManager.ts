import { randomUUID } from 'crypto';
import { Server as SocketIOServer } from 'socket.io';
import {
  ClientToServerEvents,
  DuelState,
  GameSettings,
  GameSummary,
  InterServerEvents,
  LobbyState,
  Player,
  PlayerRoundResult,
  RoundRecapPayload,
  ServerToClientEvents,
  SocketData,
} from '../../../shared/types/socket';
import { buildSpellQueue, SpellDefinition } from './spells';
import { computeRoundScore } from './scoring';

const COUNTDOWN_MS = 3000;
const ROUND_TIMEOUT_MS = 10000;
const RECAP_DELAY_MS = 1000;
const BETWEEN_ROUND_DELAY_MS = 8000;
const BEAM_THRESHOLD = 100;
const BEAM_DELTA_FACTOR = 0.5;

interface DuelSubmission {
  playerId: string;
  guess: string;
  durationMs: number;
  submittedAt: string;
}

interface RoundInFlight {
  roundNumber: number;
  promptId: string;
  spell: SpellDefinition;
  startedAt: number;
  startedAtIso: string;
  submissions: Record<string, DuelSubmission>;
  timeoutHandle?: NodeJS.Timeout;
  recapHandle?: NodeJS.Timeout;
}

interface ActiveDuel {
  roomCode: string;
  players: Player[];
  settings: GameSettings;
  spellQueue: SpellDefinition[];
  currentRoundIndex: number;
  beamOffset: number;
  totalScores: Record<string, number>;
  rounds: RoundRecapPayload[];
  roundInFlight?: RoundInFlight;
  countdownHandle?: NodeJS.Timeout;
  betweenRoundHandle?: NodeJS.Timeout;
}

interface DuelManagerDeps {
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  lobbies: Map<string, LobbyState>;
  onLobbyStateChange: (lobby: LobbyState) => void;
}

export class DuelManager {
  private duels = new Map<string, ActiveDuel>();

  constructor(private readonly deps: DuelManagerDeps) {}

  startDuel(lobby: LobbyState) {
    const spellQueue = buildSpellQueue(lobby.settings.rounds, lobby.settings.difficulty);

    const duel: ActiveDuel = {
      roomCode: lobby.roomCode,
      players: [...lobby.players],
      settings: lobby.settings,
      spellQueue,
      currentRoundIndex: 0,
      beamOffset: 0,
      totalScores: lobby.players.reduce<Record<string, number>>((acc, player) => {
        acc[player.id] = 0;
        return acc;
      }, {}),
      rounds: [],
    };

    this.duels.set(lobby.roomCode, duel);

    const duelState: DuelState = {
      roomCode: lobby.roomCode,
      round: 1,
      totalRounds: lobby.settings.rounds,
      startedAt: new Date().toISOString(),
      players: lobby.players,
      settings: lobby.settings,
      beamOffset: 0,
    };

    this.deps.io.to(lobby.roomCode).emit('duel:started', duelState);
    this.queueCountdown(duel);
  }

  handleSubmission(
    roomCode: string,
    playerId: string,
    payload: { promptId: string; guess: string; durationMs: number }
  ): string | null {
    const duel = this.duels.get(roomCode);
    if (!duel) {
      return 'no duel is active for this lobby';
    }

    const round = duel.roundInFlight;
    if (!round) {
      return 'no round in progress';
    }

    const participant = duel.players.find((player) => player.id === playerId);
    if (!participant) {
      return 'you are not part of this duel';
    }

    if (round.promptId !== payload.promptId) {
      return 'that prompt already expired';
    }

    if (round.submissions[playerId]) {
      return 'you already submitted for this round';
    }

    const sanitizedGuess = payload.guess.toUpperCase().slice(0, 64);
    const durationMs = Math.max(0, Math.min(payload.durationMs, 60000));

    round.submissions[playerId] = {
      playerId,
      guess: sanitizedGuess,
      durationMs,
      submittedAt: new Date().toISOString(),
    };

    const submissionsReceived = Object.keys(round.submissions).length;
    if (submissionsReceived === duel.players.length) {
      this.lockRound(duel);
    }

    return null;
  }

  handlePlayerLeft(roomCode: string) {
    if (!this.duels.has(roomCode)) {
      return;
    }

    const duel = this.duels.get(roomCode);
    if (!duel) {
      return;
    }

    this.completeDuel(duel, 'forfeit');
  }

  private queueCountdown(duel: ActiveDuel) {
    this.clearCountdown(duel);
    this.clearBetweenRound(duel);

    duel.countdownHandle = setTimeout(() => {
      this.startRound(duel.roomCode);
    }, COUNTDOWN_MS);

    const nextSpell = duel.spellQueue[duel.currentRoundIndex];

    this.deps.io.to(duel.roomCode).emit('duel:countdown', {
      roundNumber: duel.currentRoundIndex + 1,
      totalRounds: duel.settings.rounds,
      seconds: COUNTDOWN_MS / 1000,
      spellText: nextSpell?.text ?? '',
      readingSpeed: duel.settings.readingSpeed,
    });
  }

  private startRound(roomCode: string) {
    const duel = this.duels.get(roomCode);
    if (!duel) {
      return;
    }

    if (duel.currentRoundIndex >= duel.settings.rounds) {
      this.completeDuel(duel, 'rounds');
      return;
    }

    const spell = duel.spellQueue[duel.currentRoundIndex];
    const promptId = randomUUID();
    const roundNumber = duel.currentRoundIndex + 1;
    const startedAtIso = new Date().toISOString();

    const round: RoundInFlight = {
      roundNumber,
      promptId,
      spell,
      startedAt: Date.now(),
      startedAtIso,
      submissions: {},
    };

    duel.roundInFlight = round;
    duel.currentRoundIndex += 1;

    round.timeoutHandle = setTimeout(() => {
      this.forceRoundCompletion(duel);
    }, ROUND_TIMEOUT_MS);

    this.deps.io.to(roomCode).emit('duel:prompt', {
      roundNumber,
      totalRounds: duel.settings.rounds,
      promptId,
      spellText: spell.text,
      readingSpeed: duel.settings.readingSpeed,
      startedAt: startedAtIso,
    });
  }

  private forceRoundCompletion(duel: ActiveDuel) {
    const round = duel.roundInFlight;
    if (!round) {
      return;
    }

    duel.players.forEach((player) => {
      if (!round.submissions[player.id]) {
        round.submissions[player.id] = {
          playerId: player.id,
          guess: '',
          durationMs: ROUND_TIMEOUT_MS,
          submittedAt: new Date().toISOString(),
        };
      }
    });

    this.lockRound(duel);
  }

  private lockRound(duel: ActiveDuel) {
    const round = duel.roundInFlight;
    if (!round) {
      return;
    }

    if (round.timeoutHandle) {
      clearTimeout(round.timeoutHandle);
      round.timeoutHandle = undefined;
    }

    if (round.recapHandle) {
      return;
    }

    round.recapHandle = setTimeout(() => {
      this.completeRound(duel);
    }, RECAP_DELAY_MS);
  }

  private completeRound(duel: ActiveDuel) {
    const round = duel.roundInFlight;
    if (!round) {
      return;
    }

    round.recapHandle && clearTimeout(round.recapHandle);
    round.timeoutHandle && clearTimeout(round.timeoutHandle);

    const playerResults: PlayerRoundResult[] = duel.players.map((player) => {
      const submission = round.submissions[player.id];
      const guess = submission?.guess ?? '';
      const durationMs = submission?.durationMs ?? ROUND_TIMEOUT_MS;
      const scoring = computeRoundScore(round.spell.text, guess, durationMs);
      const cumulativeScore = duel.totalScores[player.id] + scoring.totalScore;
      duel.totalScores[player.id] = cumulativeScore;

      return {
        playerId: player.id,
        playerName: player.name,
        guess,
        accuracy: scoring.accuracy,
        baseScore: scoring.baseScore,
        bonusScore: scoring.bonusScore,
        totalScore: scoring.totalScore,
        durationMs,
        cumulativeScore,
      };
    });

    let winningPlayerId: string | null = null;
    if (playerResults.length > 0) {
      const sorted = [...playerResults].sort((a, b) => b.totalScore - a.totalScore);
      if (sorted.length === 1 || sorted[0].totalScore !== sorted[1].totalScore) {
        winningPlayerId = sorted[0].playerId;
      }
    }

    if (playerResults.length === 2) {
      const delta = playerResults[0].totalScore - playerResults[1].totalScore;
      duel.beamOffset = Math.max(-BEAM_THRESHOLD, Math.min(BEAM_THRESHOLD, duel.beamOffset + delta * BEAM_DELTA_FACTOR));
    }

    const recap: RoundRecapPayload = {
      roomCode: duel.roomCode,
      roundNumber: round.roundNumber,
      totalRounds: duel.settings.rounds,
      spell: round.spell.text,
      playerResults,
      winningPlayerId,
      beamOffset: duel.beamOffset,
    };

    duel.rounds.push(recap);
    duel.roundInFlight = undefined;

    this.deps.io.to(duel.roomCode).emit('duel:roundRecap', recap);

    const beamVictory = Math.abs(duel.beamOffset) >= BEAM_THRESHOLD;
    const roundsFinished = round.roundNumber >= duel.settings.rounds;

    if (beamVictory) {
      this.completeDuel(duel, 'beam');
      return;
    }

    if (roundsFinished) {
      this.completeDuel(duel, 'rounds');
      return;
    }

    duel.betweenRoundHandle = setTimeout(() => {
      this.queueCountdown(duel);
    }, BETWEEN_ROUND_DELAY_MS);
  }

  private completeDuel(duel: ActiveDuel, reason: GameSummary['reason']) {
    this.clearCountdown(duel);
    this.clearBetweenRound(duel);

    const standings = [...duel.players].sort(
      (a, b) => (duel.totalScores[b.id] ?? 0) - (duel.totalScores[a.id] ?? 0)
    );
    const winner = standings[0];

    const summary: GameSummary = {
      roomCode: duel.roomCode,
      winnerId: winner ? winner.id : null,
      winnerName: winner ? winner.name : null,
      reason,
      rounds: duel.rounds,
      players: duel.players.map((player) => {
        const playerRounds = duel.rounds
          .map((roundRecap) => roundRecap.playerResults.find((result) => result.playerId === player.id))
          .filter((value): value is PlayerRoundResult => Boolean(value));

        const averageAccuracy =
          playerRounds.length > 0
            ? playerRounds.reduce((sum, item) => sum + item.accuracy, 0) / playerRounds.length
            : 0;
        const averageDurationMs =
          playerRounds.length > 0
            ? playerRounds.reduce((sum, item) => sum + item.durationMs, 0) / playerRounds.length
            : 0;

        return {
          playerId: player.id,
          playerName: player.name,
          averageAccuracy,
          averageDurationMs,
          totalScore: duel.totalScores[player.id] ?? 0,
        };
      }),
    };

    this.deps.io.to(duel.roomCode).emit('duel:completed', summary);
    this.resetLobby(duel.roomCode);
    this.duels.delete(duel.roomCode);
  }

  private resetLobby(roomCode: string) {
    const lobby = this.deps.lobbies.get(roomCode);
    if (!lobby) {
      return;
    }

    lobby.phase = 'lobby';
    lobby.players = lobby.players.map((player) => ({
      ...player,
      ready: false,
    }));
    this.deps.onLobbyStateChange(lobby);
  }

  private clearCountdown(duel: ActiveDuel) {
    if (duel.countdownHandle) {
      clearTimeout(duel.countdownHandle);
      duel.countdownHandle = undefined;
    }
  }

  private clearBetweenRound(duel: ActiveDuel) {
    if (duel.betweenRoundHandle) {
      clearTimeout(duel.betweenRoundHandle);
      duel.betweenRoundHandle = undefined;
    }
  }
}

