import { SpellDifficulty } from '../../../shared/types/socket';

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

const spellData: SpellDictionary = {
  easy: createSpellList('easy', [
    'LUMOS',
    'NOX',
    'RIDDIKULUS',
    'ALO HOMORA',
    'WINGARDIUM LEVIOSA',
    'PROTEGO',
    'FINITE',
    'EXPELLIARMUS',
    'QUIETUS',
    'REPARO',
    'SONORUS',
    'LUMOS MAXIMA',
    'OBLIVIATE',
    'PETRIFICUS TOTALUS',
    'INCENDIO',
    'DIFFINDO',
    'GLACIUS',
    'SCURGIFY',
    'MUFFLIATO',
    'IMMOBULUS',
  ]),
  medium: createSpellList('medium', [
    'EXPECTO PATRONUM',
    'SECTUMSEMPRA',
    'REDUCTO',
    'AVIFORS',
    'LEVICORPUS',
    'IMPERVIUS',
    'ARRESTO MOMENTUM',
    'CONFUNDO',
    'SILENCIO',
    'FERULA',
    'OPPUGNO',
    'RAPTORIALIS IGNIS',
    'CAELUM TEMPESTAS',
    'VENTUS TURBINE',
    'FULGARIUS',
    'CALIGO SPIRA',
    'MORS VINCULA',
    'VIGILO OCULUS',
    'VOLATUS AETERNA',
    'TENEBRAE LIGARE',
  ]),
  hard: createSpellList('hard', [
    'AVADA KEDAVRA',
    'CRUCIO',
    'IMPERIO',
    'FIENDFYRE',
    'HORRENDUM SPIRA',
    'AER LACERUM',
    'MORS CERULEA',
    'VULNERA SANENTUR',
    'INCURSUS NOCTURNA',
    'UMBRA CONFLAGRATIO',
    'VOLATILIS FULMEN',
    'SANGUINIS CIRCULO',
    'NECROSI CATENA',
    'OBSCURA VERITAS',
    'INFINITAS SOMNUS',
    'MALIFICUS LAMINA',
    'GLACIES RUINAM',
    'FUROR TEMPESTAS',
    'ARCANA VORTEX',
    'UMBRAE DEVORO',
  ]),
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

