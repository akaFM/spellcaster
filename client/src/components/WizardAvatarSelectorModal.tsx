import type { FC } from 'react';
import Modal from './Modal';
import type { Wizard } from '../types/wizard';

interface WizardAvatarSelectorModalProps {
  wizards: Wizard[];
  selectedWizardId: string;
  onSelect: (wizardId: string) => void;
  onClose: () => void;
}

const WizardAvatarSelectorModal: FC<WizardAvatarSelectorModalProps> = ({
  wizards,
  selectedWizardId,
  onSelect,
  onClose,
}) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Choose Your Wizard">
      <p className="text-sm text-slate-300">
        Pick the arcane partner whose vibes match your spelling prowess. Each wizard has a unique
        beam hue that we&apos;ll use in-game later.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {wizards.map((wizard) => {
          const isSelected = wizard.id === selectedWizardId;

          return (
            <button
              key={wizard.id}
              type="button"
              onClick={() => onSelect(wizard.id)}
              className={`group flex items-center gap-4 rounded-2xl border bg-white/5 p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 ${
                isSelected
                  ? 'border-emerald-400/80 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                  : 'border-white/10 hover:border-emerald-300/70 hover:bg-white/10'
              }`}
            >
              <div className="flex h-24 w-24 items-center justify-center  ">
                {wizard.imageUrl ? (
                  <img
                    src={wizard.imageUrl}
                    alt={wizard.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className="h-24 w-24 rounded-full border border-white/10"
                    style={{ background: wizard.color }}
                  />
                )}
              </div>

              <div className="space-y-2 text-left">
                <div>
                  <p className="text-lg font-semibold text-white">{wizard.name}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>beam color</span>
                  <span
                    className="inline-flex h-4 w-4 rounded-full border border-white/10"
                    style={{ background: wizard.color }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

export default WizardAvatarSelectorModal;

