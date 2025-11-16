import { SpellDifficulty } from '../../../shared/types/socket';
import spellCatalog from './spellCatalog.json';

export interface SpellDefinition {
  id: string;
  text: string;
  difficulty: SpellDifficulty;
}

type SpellDictionary = Record<SpellDifficulty, SpellDefinition[]>;

const createSpellList = (difficulty: SpellDifficulty, incantations: string[]): SpellDefinition[] =>
  incantations.map((text, index) => ({
    id: `${difficulty}-${index}`,
    text,
    difficulty,
  }));

const spellWords = spellCatalog as Record<SpellDifficulty, string[]>;

const spellData: SpellDictionary = {
  easy: createSpellList('easy', spellWords.easy),
  medium: createSpellList('medium', spellWords.medium),
  hard: createSpellList('hard', spellWords.hard),
};

export function getSpellPool(difficulty: SpellDifficulty): SpellDefinition[] {
  return spellData[difficulty];
}

export function buildSpellQueue(rounds: number, difficulty: SpellDifficulty): SpellDefinition[] {
  const pool = [...getSpellPool(difficulty)];
  const queue: SpellDefinition[] = [];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  while (queue.length < rounds) {
    const next = pool[queue.length % pool.length];
    queue.push({
      ...next,
      id: `${next.id}-${queue.length}`,
    });
  }

  return queue.slice(0, rounds);
}

