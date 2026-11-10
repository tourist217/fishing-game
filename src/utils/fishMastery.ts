import type { FishJournalEntry } from '../hooks/usePlayerState';

export interface FishMasteryLevel {
  star: number;
  title: string;
  condition: string;
  bonusDescription: string;
  isUnlocked: boolean;
}

export interface FishMasteryResult {
  stars: number;
  levels: FishMasteryLevel[];
  activeBonusSummary: string[];
}

export function getFishMastery(entry?: FishJournalEntry | null): FishMasteryResult {
  const count = entry?.count || 0;
  const hasTrophy = Boolean(entry?.hasTrophy);
  const hasLegendary = Boolean(entry?.hasLegendary);
  const isDiscovered = count > 0;

  const star1 = isDiscovered;
  const star2 = count >= 15;
  const star3 = count >= 60;
  const star4 = hasTrophy;
  const star5 = hasLegendary;

  let stars = 0;
  if (star1) stars++;
  if (star2) stars++;
  if (star3) stars++;
  if (star4) stars++;
  if (star5) stars++;

  const levels: FishMasteryLevel[] = [
    {
      star: 1,
      title: 'Первое знакомство',
      condition: 'Поймать 1 особь вида',
      bonusDescription: 'Открывает записи бестиария и повадки',
      isUnlocked: star1,
    },
    {
      star: 2,
      title: 'Опытный рыболов',
      condition: 'Выловить 15 рыб этого вида',
      bonusDescription: 'Цена продажи этого вида +5%',
      isUnlocked: star2,
    },
    {
      star: 3,
      title: 'Знаток водоёмов',
      condition: 'Выловить 60 рыб этого вида',
      bonusDescription: 'Частота клёва этого вида +10%',
      isUnlocked: star3,
    },
    {
      star: 4,
      title: 'Охотник за трофеями',
      condition: 'Выловить трофейный экземпляр',
      bonusDescription: 'Шанс поклёвки трофея +1%',
      isUnlocked: star4,
    },
    {
      star: 5,
      title: 'Легенда глубин',
      condition: 'Выловить легендарную рыбу (рекорд вида)',
      bonusDescription: 'Опыт за вылов этого вида +25%',
      isUnlocked: star5,
    },
  ];

  const activeBonusSummary: string[] = [];
  if (star2) activeBonusSummary.push('+5% к цене продажи');
  if (star3) activeBonusSummary.push('+10% к шансу клёва');
  if (star4) activeBonusSummary.push('+1% к шансу трофея');
  if (star5) activeBonusSummary.push('+25% к опыту');

  return { stars, levels, activeBonusSummary };
}
