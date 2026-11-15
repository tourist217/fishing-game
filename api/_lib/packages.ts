export interface GemPackage {
  id: string;
  gems: number;
  stars: number;
  title: string;
  description: string;
}

export const GEM_PACKAGES: Record<string, GemPackage> = {
  pack_50: {
    id: 'pack_50',
    gems: 50,
    stars: 25,
    title: '50 Алмазов',
    description: 'Горсть алмазов для рыбалки в Fishing Game',
  },
  pack_150: {
    id: 'pack_150',
    gems: 150,
    stars: 70,
    title: '150 Алмазов (+20% Бонус)',
    description: 'Мешочек кристаллов для рыбалки в Fishing Game',
  },
  pack_500: {
    id: 'pack_500',
    gems: 500,
    stars: 200,
    title: '500 Алмазов (Хит 🔥)',
    description: 'Сундук старателя для рыбалки в Fishing Game',
  },
  pack_1200: {
    id: 'pack_1200',
    gems: 1200,
    stars: 450,
    title: '1200 Алмазов (+50% Макс)',
    description: 'Сокровищница озера для рыбалки в Fishing Game',
  },
};
