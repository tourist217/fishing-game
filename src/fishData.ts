export interface Fish {
  id: string;
  name: string;
  minWeight: number; // кг
  maxWeight: number; // кг
  basePrice: number; // монет за кг
  baseExp: number;   // опыта за кг
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  minRodReq: number; // 1 - бамбук, 2 - стеклопластик, 3 - карбон, 4 - титан
}

export const FISH_DATABASE: Fish[] = [
  // 1. Мелкая мирная рыба (доступна с 1 уровня)
  {
    id: 'crucian_small',
    name: 'Карасик',
    minWeight: 0.15,
    maxWeight: 0.45,
    basePrice: 16,
    baseExp: 20,
    rarity: 'common',
    icon: '🐠',
    minRodReq: 1,
  },
  {
    id: 'roach_small',
    name: 'Плотвичка',
    minWeight: 0.1,
    maxWeight: 0.35,
    basePrice: 18,
    baseExp: 22,
    rarity: 'common',
    icon: '🐟',
    minRodReq: 1,
  },
  {
    id: 'perch_small',
    name: 'Окушок',
    minWeight: 0.1,
    maxWeight: 0.4,
    basePrice: 20,
    baseExp: 24,
    rarity: 'common',
    icon: '🐟',
    minRodReq: 1,
  },

  // 2. Средняя рыба (подлещик доступен с 1 уровня, но крупнее)
  {
    id: 'bream_small',
    name: 'Подлещик',
    minWeight: 0.5,
    maxWeight: 1.1,
    basePrice: 28,
    baseExp: 32,
    rarity: 'rare',
    icon: '🐡',
    minRodReq: 1,
  },

  // 3. Крупная рыба (требует удочку от 2 уровня)
  {
    id: 'crucian_large',
    name: 'Золотой Карась (крупный)',
    minWeight: 1.2,
    maxWeight: 2.2,
    basePrice: 45,
    baseExp: 50,
    rarity: 'rare',
    icon: '🐠',
    minRodReq: 2,
  },
  {
    id: 'roach_large',
    name: 'Плотва крупная',
    minWeight: 0.8,
    maxWeight: 1.8,
    basePrice: 40,
    baseExp: 45,
    rarity: 'rare',
    icon: '🐟',
    minRodReq: 2,
  },
];

const BAIT_WEIGHTS: Record<string, Record<string, number>> = {
  bread: {
    crucian_small: 50,
    roach_small: 50,
    bream_small: 20,
    crucian_large: 5,
    roach_large: 5,
    perch_small: 0,
  },
  dough: {
    crucian_small: 50,
    roach_small: 50,
    bream_small: 20,
    crucian_large: 5,
    roach_large: 5,
    perch_small: 0,
  },
  worm: {
    perch_small: 40,
    bream_small: 40,
    crucian_small: 40,
    roach_small: 15,
    crucian_large: 5,
    roach_large: 5,
  },
  maggot: {
    perch_small: 40,
    bream_small: 40,
    crucian_small: 40,
    roach_small: 15,
    crucian_large: 5,
    roach_large: 5,
  },
  bloodworm: {
    perch_small: 40,
    bream_small: 40,
    crucian_small: 40,
    roach_small: 15,
    crucian_large: 5,
    roach_large: 5,
  },
  corn: {
    crucian_small: 0,
    roach_small: 0,
    perch_small: 0,
    bream_small: 30,
    crucian_large: 45,
    roach_large: 45,
  },
};

export function getRandomFish(
  playerRodLevel: number = 1,
  baitId: string = 'worm',
  locationWeightModifier: number = 1.0
): {
  fish: Fish;
  weight: number;
  price: number;
  exp: number;
  rodBrokenRisk?: boolean;
} {
  const baitProfile = BAIT_WEIGHTS[baitId] || BAIT_WEIGHTS['worm'];

  const candidates: { fish: Fish; weightChance: number }[] = [];
  for (const fish of FISH_DATABASE) {
    const chance = baitProfile[fish.id] || 0;
    if (chance > 0) {
      candidates.push({ fish, weightChance: chance });
    }
  }

  const totalWeight = candidates.reduce((sum, item) => sum + item.weightChance, 0);
  let randomRoll = Math.random() * totalWeight;
  let selectedFish = candidates[0].fish;

  for (const item of candidates) {
    if (randomRoll < item.weightChance) {
      selectedFish = item.fish;
      break;
    }
    randomRoll -= item.weightChance;
  }

  // Расчет веса с учётом модификатора водоёма
  const rawBaseWeight = selectedFish.minWeight + Math.random() * (selectedFish.maxWeight - selectedFish.minWeight);
  const modifiedWeight = rawBaseWeight * locationWeightModifier;
  const weight = Math.round(modifiedWeight * 100) / 100;

  // Если модификатор увеличил рыбу свыше 1.3 кг, бамбуковая удочка первого уровня рискует не выдержать
  const isTooHeavyForBamboo = playerRodLevel === 1 && weight > 1.3;
  const rodBrokenRisk = selectedFish.minRodReq > playerRodLevel || isTooHeavyForBamboo;

  const price = Math.max(1, Math.round(weight * selectedFish.basePrice));
  const exp = Math.max(5, Math.round(weight * selectedFish.baseExp));

  return {
    fish: selectedFish,
    weight,
    price,
    exp,
    rodBrokenRisk,
  };
}