import { useEffect, useRef, useState } from 'react';
import type { Player, RoundRecapPayload } from '../../../shared/types/socket';
import type { Wizard } from '../types/wizard';
import wizardPurple from '../assets/spellcaster-wizards/wizard-purple.png';
import wizardRed from '../assets/spellcaster-wizards/wizard-red.png';
import wizardBlue from '../assets/spellcaster-wizards/wizard-blue.png';
import wizardGreen from '../assets/spellcaster-wizards/wizard-green.png';
import wizardOrange from '../assets/spellcaster-wizards/wizard-orange.png';
import wizardGrey from '../assets/spellcaster-wizards/wizard-grey.png';

const WIZARDS: Wizard[] = [
  {
    id: 'violet-warden',
    name: 'Violet Vowel',
    color: '#a78bfa',
    description: 'Calm focus. Loves perfect cadence.',
    imageUrl: wizardPurple,
  },
  {
    id: 'crimson-aegis',
    name: 'Red Rhyme',
    color: '#f87171',
    description: 'Aggressive caster with fiery streaks.',
    imageUrl: wizardRed,
  },
  {
    id: 'azure-sage',
    name: 'Blue Backspace',
    color: '#38bdf8',
    description: 'Quick thinker, thrives on momentum.',
    imageUrl: wizardBlue,
  },
  {
    id: 'emerald-scribe',
    name: 'Green Grammar',
    color: '#34d399',
    description: 'Lore keeper of the dueling halls.',
    imageUrl: wizardGreen,
  },
  {
    id: 'golden-starling',
    name: 'Orange Oops',
    color: '#fcd34d',
    description: 'Flashy tactician — accuracy under pressure.',
    imageUrl: wizardOrange,
  },
  {
    id: 'obsidian-mage',
    name: 'Grey Ghostwriter',
    color: '#94a3b8',
    description: 'Steady and unshakable aura.',
    imageUrl: wizardGrey,
  },
];

interface WizardBeamProps {
  players: Player[];
  beamOffset?: number;
  roundRecap?: RoundRecapPayload | null;
  localPlayerId?: string | null;
}

const BEAM_RANGE = 100;

export function WizardBeam({ players, beamOffset = 0, roundRecap, localPlayerId }: WizardBeamProps) {
  // Ensure we have both players, with host on left
  const hostPlayer = players.find(p => p.isHost);
  const nonHostPlayer = players.find(p => !p.isHost);
  const leftWizard = hostPlayer ?? players[0];
  const rightWizard = nonHostPlayer ?? players[1];
  
  const normalized = (beamOffset + BEAM_RANGE) / (BEAM_RANGE * 2);
  const intersectionPercent = Math.max(0, Math.min(100, normalized * 100));
  
  const [leftHop, setLeftHop] = useState(false);
  const [rightHop, setRightHop] = useState(false);
  const prevRoundNumberRef = useRef<number | null>(null);

  const getWizardForPlayer = (wizardId?: string): Wizard | null => {
    if (!wizardId) return WIZARDS[0]; // Default to purple
    return WIZARDS.find((w) => w.id === wizardId) ?? WIZARDS[0];
  };

  const leftWizardData = leftWizard ? getWizardForPlayer(leftWizard.wizardId) : null;
  const rightWizardData = rightWizard ? getWizardForPlayer(rightWizard.wizardId) : null;

  // Detect round completion and trigger hop animation for winning player
  useEffect(() => {
    if (roundRecap && roundRecap.winningPlayerId && roundRecap.roundNumber !== prevRoundNumberRef.current) {
      // The winning player should hop
      if (roundRecap.winningPlayerId === leftWizard?.id) {
        setLeftHop(true);
        setTimeout(() => setLeftHop(false), 600);
      } else if (roundRecap.winningPlayerId === rightWizard?.id) {
        setRightHop(true);
        setTimeout(() => setRightHop(false), 600);
      }
      
      prevRoundNumberRef.current = roundRecap.roundNumber;
    }
  }, [roundRecap, leftWizard?.id, rightWizard?.id]);

  // Calculate beam widths
  const leftBeamWidth = intersectionPercent;
  const rightBeamWidth = 100 - intersectionPercent;

  return (
    <div className="card-glow rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_50px_rgba(4,0,23,0.7)] backdrop-blur-2xl">
      <div className="relative h-64 flex items-end justify-between px-4">
        {/* Left Wizard */}
        {leftWizard && leftWizardData && (
          <div className="flex flex-col items-center gap-2 z-10">
            <div
              className={`relative transition-transform duration-300 ${
                leftHop ? 'animate-bounce' : ''
              }`}
              style={{ transform: leftHop ? 'translateY(-20px)' : 'translateY(0)' }}
            >
              <div className="relative w-24 h-24">
                <img
                  src={leftWizardData.imageUrl}
                  alt={leftWizardData.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-incantation text-white">
                {leftWizard.name}
                {leftWizard.id === localPlayerId && (
                  <span className="text-xs text-emerald-300 ml-1">(you)</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Beam Area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-2 flex items-center">
            {/* Left Beam */}
            {leftWizardData && (
              <div
                className="absolute left-0 h-full transition-all duration-700 ease-out"
                style={{
                  width: `${leftBeamWidth}%`,
                  background: `linear-gradient(to right, ${leftWizardData.color}, ${leftWizardData.color}dd, ${leftWizardData.color}88)`,
                  boxShadow: `0 0 20px ${leftWizardData.color}80, 0 0 40px ${leftWizardData.color}40, inset 0 0 20px ${leftWizardData.color}60`,
                  filter: 'blur(1px)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{
                    background: leftWizardData.color,
                    boxShadow: `0 0 20px ${leftWizardData.color}, 0 0 40px ${leftWizardData.color}80`,
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }}
                />
              </div>
            )}

            {/* Right Beam */}
            {rightWizardData && (
              <div
                className="absolute right-0 h-full transition-all duration-700 ease-out"
                style={{
                  width: `${rightBeamWidth}%`,
                  background: `linear-gradient(to left, ${rightWizardData.color}, ${rightWizardData.color}dd, ${rightWizardData.color}88)`,
                  boxShadow: `0 0 20px ${rightWizardData.color}80, 0 0 40px ${rightWizardData.color}40, inset 0 0 20px ${rightWizardData.color}60`,
                  filter: 'blur(1px)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/30 to-transparent animate-pulse" />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{
                    background: rightWizardData.color,
                    boxShadow: `0 0 20px ${rightWizardData.color}, 0 0 40px ${rightWizardData.color}80`,
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }}
                />
              </div>
            )}

            {/* Intersection Point */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full transition-all duration-700 ease-out"
              style={{
                left: `${intersectionPercent}%`,
                background: `radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 50%, transparent 100%)`,
                boxShadow: `0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.4)`,
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
          </div>
        </div>

        {/* Right Wizard (Mirrored) */}
        {rightWizard && rightWizardData && (
          <div className="flex flex-col items-center gap-2 z-10">
            <div
              className={`relative transition-transform duration-300 ${
                rightHop ? 'animate-bounce' : ''
              }`}
              style={{ transform: rightHop ? 'translateY(-20px)' : 'translateY(0)' }}
            >
              <div className="relative w-24 h-24">
                <img
                  src={rightWizardData.imageUrl}
                  alt={rightWizardData.name}
                  className="w-full h-full object-cover rounded-full"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-incantation text-white">
                {rightWizard.name}
                {rightWizard.id === localPlayerId && (
                  <span className="text-xs text-emerald-300 ml-1">(you)</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
