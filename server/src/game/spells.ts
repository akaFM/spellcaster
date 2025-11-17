import { SpellDifficulty } from '../../../shared/types/socket';
import spellCatalog from './spellCatalog.json';

export interface SpellDefinition {
  id: string;
  text: string;
  difficulty: SpellDifficulty;
}

type CatalogDifficulty = Exclude<SpellDifficulty, 'custom'>;
type SpellDictionary = Record<CatalogDifficulty, SpellDefinition[]>;

const createSpellList = (difficulty: SpellDifficulty, incantations: string[]): SpellDefinition[] =>
  incantations.map((text, index) => ({
    id: `${difficulty}-${index}`,
    text,
    difficulty,
  }));

const spellWords = spellCatalog as Record<CatalogDifficulty, string[]>;

const spellData: SpellDictionary = {
  easy: createSpellList('easy', spellWords.easy),
  medium: createSpellList('medium', spellWords.medium),
  hard: createSpellList('hard', spellWords.hard),
};

export function getSpellPool(difficulty: SpellDifficulty, customWords?: string[]): SpellDefinition[] {
  if (difficulty === 'custom') {
    return createSpellList('custom', customWords ?? []);
  }
  return spellData[difficulty];
}

export function buildSpellQueue(
  rounds: number,
  difficulty: SpellDifficulty,
  customWords?: string[]
): SpellDefinition[] {
  const sourcePool = getSpellPool(difficulty, customWords);
  const pool = sourcePool.length > 0 ? [...sourcePool] : [...getSpellPool('medium')];
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

