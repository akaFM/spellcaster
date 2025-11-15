import Modal from './Modal';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlayModal = ({ isOpen, onClose }: HowToPlayModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How the Duel Works">
      <div className="space-y-4 text-slate-100">
        <section>
          <h3 className="text-lg font-semibold text-emerald-200">Objective</h3>
          <p className="text-sm text-slate-300">
            Outspell your rival across quick-fire rounds. Each correct letter pushes your spell beam
            closer to victory.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-emerald-200">Round Flow</h3>
          <ul className="list-disc space-y-2 pl-6 text-sm text-slate-300">
            <li>Listen to the announcer and preview the difficulty hint.</li>
            <li>Breathe during the 3-2-1 countdown — no peeking at your keyboard.</li>
            <li>
              Type the word from memory while your wizard channels the spell. No edits once you hit
              enter.
            </li>
            <li>Compare the results when the timer ends to see whose magic was sharper.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-emerald-200">Winning</h3>
          <p className="text-sm text-slate-300">
            Every accurate letter nudges your beam toward your opponent. Reach their sigil first to
            win the duel — tie rounds keep the beam in the middle.
          </p>
        </section>
      </div>
    </Modal>
  );
};

export default HowToPlayModal;

