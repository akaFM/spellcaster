import { useEffect, useRef, useState } from 'react';
import type { Player, RoundRecapPayload } from '../../../shared/types/socket';
import type { Wizard } from '../types/wizard';
import wizardPurple from '../assets/spellcaster-wizards/wizard-purple.png';
import wizardRed from '../assets/spellcaster-wizards/wizard-red.png';
import wizardBlue from '../assets/spellcaster-wizards/wizard-blue.png';
import wizardGreen from '../assets/spellcaster-wizards/wizard-green.png';
import wizardOrange from '../assets/spellcaster-wizards/wizard-orange.png';
import wizardGrey from '../assets/spellcaster-wizards/wizard-grey.png';
import { LightningBeam, type Point } from './LightningBeam';

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

export function WizardBeam({ players, beamOffset = 0, roundRecap, localPlayerId }: WizardBeamProps) {
  // Ensure we have both players, with host on left
  const hostPlayer = players.find(p => p.isHost);
  const nonHostPlayer = players.find(p => !p.isHost);
  const leftWizard = hostPlayer ?? players[0];
  const rightWizard = nonHostPlayer ?? players[1];
  
  const [leftHop, setLeftHop] = useState(false);
  const [rightHop, setRightHop] = useState(false);
  const prevRoundNumberRef = useRef<number | null>(null);

  // Refs for wand tip positions
  const containerRef = useRef<HTMLDivElement>(null);
  const leftWandTipRef = useRef<HTMLDivElement>(null);
  const rightWandTipRef = useRef<HTMLDivElement>(null);
  const [leftWandTip, setLeftWandTip] = useState<Point | null>(null);
  const [rightWandTip, setRightWandTip] = useState<Point | null>(null);

  const getWizardForPlayer = (wizardId?: string): Wizard | null => {
    if (!wizardId) return WIZARDS[0]; // Default to purple
    return WIZARDS.find((w) => w.id === wizardId) ?? WIZARDS[0];
  };

  const leftWizardData = leftWizard ? getWizardForPlayer(leftWizard.wizardId) : null;
  const rightWizardData = rightWizard ? getWizardForPlayer(rightWizard.wizardId) : null;

  // Detect round completion and trigger hop animation for winning player
  useEffect(() => {
    if (roundRecap && roundRecap.winningPlayerId && roundRecap.roundNumber !== prevRoundNumberRef.current) {
      // The winning player should hop with a more dramatic bounce
      if (roundRecap.winningPlayerId === leftWizard?.id) {
        setLeftHop(true);
        // Longer duration for smoother, more dramatic hop
        setTimeout(() => setLeftHop(false), 500);
      } else if (roundRecap.winningPlayerId === rightWizard?.id) {
        setRightHop(true);
        // Longer duration for smoother, more dramatic hop
        setTimeout(() => setRightHop(false), 500);
      }
      
      prevRoundNumberRef.current = roundRecap.roundNumber;
    }
  }, [roundRecap, leftWizard?.id, rightWizard?.id]);

  // Update wand tip positions
  const updateWandPositions = () => {
    if (!containerRef.current) {
      setLeftWandTip(null);
      setRightWandTip(null);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();

    // Calculate left wand tip position
    if (leftWandTipRef.current) {
      const leftRect = leftWandTipRef.current.getBoundingClientRect();
      const x = leftRect.left + leftRect.width / 2 - containerRect.left;
      const y = leftRect.top + leftRect.height / 2 - containerRect.top;
      
      // Only update if we have valid coordinates
      if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
        setLeftWandTip({ x, y });
      }
    } else {
      setLeftWandTip(null);
    }

    // Calculate right wand tip position
    if (rightWandTipRef.current) {
      const rightRect = rightWandTipRef.current.getBoundingClientRect();
      const x = rightRect.left + rightRect.width / 2 - containerRect.left;
      const y = rightRect.top + rightRect.height / 2 - containerRect.top;
      
      // Only update if we have valid coordinates
      if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
        setRightWandTip({ x, y });
      }
    } else {
      setRightWandTip(null);
    }
  };

  // Calculate beam endpoints - both beams extend the same distance toward the center
  // This ensures both beams are equal length and meet in the middle
  const calculateBeamEndpoints = (): { leftEnd: Point; rightEnd: Point } | null => {
    if (!leftWandTip || !rightWandTip || !containerRef.current) {
      return null;
    }

    // Calculate the distance and direction between the two wand tips
    const dx = rightWandTip.x - leftWandTip.x;
    const dy = rightWandTip.y - leftWandTip.y;
    const totalDistance = Math.sqrt(dx * dx + dy * dy);
    const halfDistance = totalDistance / 2;

    // Normalize beamOffset from [-100, 100] to adjust where beams meet
    // 0 = center, positive = right wins, negative = left wins
    const offsetPercent = beamOffset / 100; // -1 to 1
    const offsetDistance = (halfDistance * offsetPercent) * 0.3; // Scale down the offset for subtlety

    // Both beams extend the same distance toward the center, with slight offset based on beamOffset
    // Left beam extends from left wand tip toward the center (to the right)
    const leftEnd: Point = {
      x: leftWandTip.x + (dx / totalDistance) * (halfDistance + offsetDistance),
      y: leftWandTip.y + (dy / totalDistance) * (halfDistance + offsetDistance),
    };

    // Right beam extends from right wand tip toward the center (to the left)
    const rightEnd: Point = {
      x: rightWandTip.x - (dx / totalDistance) * (halfDistance - offsetDistance),
      y: rightWandTip.y - (dy / totalDistance) * (halfDistance - offsetDistance),
    };

    // Ensure beams extend in the correct direction (left beam goes right, right beam goes left)
    // Left beam must extend to the right of the left wand tip
    if (leftEnd.x <= leftWandTip.x) {
      // If somehow calculated backwards, extend at least halfway
      const midX = (leftWandTip.x + rightWandTip.x) / 2;
      const midY = (leftWandTip.y + rightWandTip.y) / 2;
      leftEnd.x = midX;
      leftEnd.y = midY;
    }
    
    // Right beam must extend to the left of the right wand tip
    if (rightEnd.x >= rightWandTip.x) {
      // If somehow calculated backwards, extend at least halfway
      const midX = (leftWandTip.x + rightWandTip.x) / 2;
      const midY = (leftWandTip.y + rightWandTip.y) / 2;
      rightEnd.x = midX;
      rightEnd.y = midY;
    }

    return { leftEnd, rightEnd };
  };

  // Update positions on mount, resize, and when wizards change
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    const updatePositions = () => {
      requestAnimationFrame(() => {
        updateWandPositions();
        // Also try again after a short delay to catch any late layout changes
        setTimeout(updateWandPositions, 50);
        setTimeout(updateWandPositions, 200);
      });
    };

    updatePositions();

    const handleResize = () => {
      updateWandPositions();
    };

    window.addEventListener('resize', handleResize);
    
    // Use MutationObserver to watch for layout changes
    let observer: MutationObserver | null = null;
    if (containerRef.current) {
      observer = new MutationObserver(() => {
        updateWandPositions();
      });
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [leftWizard, rightWizard, leftWizardData, rightWizardData, leftHop, rightHop]);

  // Calculate beam endpoints - both beams are equal length
  const beamEndpoints = calculateBeamEndpoints();
  
  // Determine if beams should be active (during duel, when both wizards are present and we have positions)
  const beamsActive = Boolean(
    leftWizard && 
    rightWizard && 
    leftWandTip && 
    rightWandTip && 
    beamEndpoints &&
    leftWizardData &&
    rightWizardData
  );

  return (
    <div 
      ref={containerRef}
      className="card-glow rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_50px_rgba(4,0,23,0.7)] backdrop-blur-2xl"
    >
      <div className="relative h-64 flex items-end justify-between px-4">
        {/* Left Wizard */}
        {leftWizard && leftWizardData && (
          <div className="flex flex-col items-center gap-2" style={{ zIndex: 5, position: 'relative' }}>
            <div
              className="relative"
              style={{ 
                transform: leftHop ? 'translateY(-35px)' : 'translateY(0)',
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div className="relative w-24 h-24">
                <img
                  src={leftWizardData.imageUrl}
                  alt={leftWizardData.name}
                  className="w-full h-full object-cover rounded-full"
                />
                {/* Wand tip marker - positioned at the actual wand tip (upper-right area where wand extends) */}
                <div
                  ref={leftWandTipRef}
                  className="absolute w-2 h-2 pointer-events-none"
                  style={{ 
                    top: '10%',
                    left: '85%',
                    transform: 'translate(-50%, -50%)',
                    // Position at the wand tip - very close to right edge, upper area where wand extends outward
                  }}
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

        {/* Right Wizard (Mirrored) */}
        {rightWizard && rightWizardData && (
          <div className="flex flex-col items-center gap-2" style={{ zIndex: 5, position: 'relative', isolation: 'auto' }}>
            <div
              className="relative"
              style={{ 
                transform: rightHop ? 'translateY(-35px)' : 'translateY(0)',
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div className="relative w-24 h-24">
                <img
                  src={rightWizardData.imageUrl}
                  alt={rightWizardData.name}
                  className="w-full h-full object-cover rounded-full"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {/* Wand tip marker - positioned at the actual wand tip  */}
                <div
                  ref={rightWandTipRef}
                  className="absolute w-2 h-2 pointer-events-none"
                  style={{ 
                    top: '10%',
                    left: '-35%',
                    transform: 'translate(-50%, -50%)',
                  }}
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

        {/* Lightning Beams Overlay - Two separate beams, one from each wizard */}
        {beamsActive && leftWandTip && rightWandTip && beamEndpoints && leftWizardData && rightWizardData && (
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{ 
              zIndex: 30,
              position: 'absolute',
              isolation: 'isolate',
            }}
          >
            {/* Left wizard's beam - equal length from left wand tip */}
            <LightningBeam
              start={leftWandTip}
              end={beamEndpoints.leftEnd}
              color={leftWizardData.color}
              thickness={7}
              glowSize={24}
              active={beamsActive}
            />
            {/* Right wizard's beam - equal length from right wand tip */}
            <LightningBeam
              start={rightWandTip}
              end={beamEndpoints.rightEnd}
              color={rightWizardData.color}
              thickness={7}
              glowSize={24}
              active={beamsActive}
            />
          </div>
        )}
      </div>
    </div>
  );
}
