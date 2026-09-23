export interface Fish {
  id: string;
  name: string;
  minWeight: number; // кг
  maxWeight: number; // кг
  basePrice: number; // монет за кг
  baseExp: number;   // опыта за кг
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

export const FISH_DATABASE: Fish[] = [
  // Мелкая прибрежная рыба (камыш и бамбук)
  {
    id: 'gudgeon',
    name: 'Пескарь',
    minWeight: 0.04,
    maxWeight: 0.12,
    basePrice: 22,
    baseExp: 15,
    rarity: 'common',
    icon: '🐟',
  },
  {
    id: 'crucian_small',
    name: 'Карасик серебряный',
    minWeight: 0.1,
    maxWeight: 0.35,
    basePrice: 18,
    baseExp: 18,
    rarity: 'common',
    icon: '🐠',
  },
  {
    id: 'roach_small',
    name: 'Плотвичка',
    minWeight: 0.08,
    maxWeight: 0.3,
    basePrice: 20,
    baseExp: 20,
    rarity: 'common',
    icon: '🐟',
  },
  {
    id: 'perch_small',
    name: 'Окушок полосатый',
    minWeight: 0.1,
    maxWeight: 0.4,
    basePrice: 24,
    baseExp: 22,
    rarity: 'common',
    icon: '🐟',
  },

  // Средняя рыба (бамбук 3-5 ур., телескоп)
  {
    id: 'bream_small',
    name: 'Подлещик',
    minWeight: 0.4,
    maxWeight: 0.95,
    basePrice: 28,
    baseExp: 30,
    rarity: 'rare',
    icon: '🐡',
  },
  {
    id: 'crucian_large',
    name: 'Золотой Карась',
    minWeight: 0.6,
    maxWeight: 1.8,
    basePrice: 42,
    baseExp: 45,
    rarity: 'rare',
    icon: '🐠',
  },
  {
    id: 'chub',
    name: 'Голавль',
    minWeight: 0.7,
    maxWeight: 2.2,
    basePrice: 38,
    baseExp: 40,
    rarity: 'rare',
    icon: '🐟',
  },

  // Крупная рыба (стеклопластик, композит, карбон)
  {
    id: 'carp_mirror',
    name: 'Зеркальный Карп',
    minWeight: 2.0,
    maxWeight: 6.5,
    basePrice: 55,
    baseExp: 60,
    rarity: 'epic',
    icon: '🐡',
  },
  {
    id: 'pike_river',
    name: 'Щука речная',
    minWeight: 1.5,
    maxWeight: 8.0,
    basePrice: 65,
    baseExp: 75,
    rarity: 'epic',
    icon: '🐊',
  },
  {
    id: 'catfish_giant',
    name: 'Сом Озёрный',
    minWeight: 8.0,
    maxWeight: 35.0,
    basePrice: 90,
    baseExp: 110,
    rarity: 'legendary',
    icon: '🐋',
  },
];

const BAIT_WEIGHTS: Record<string, Record<string, number>> = {
  bread: {
    gudgeon: 40,
    crucian_small: 50,
    roach_small: 45,
    bream_small: 15,
    crucian_large: 5,
    chub: 0,
    carp_mirror: 2,
    pike_river: 0,
    catfish_giant: 0,
    perch_small: 0,
  },
  dough: {
    gudgeon: 30,
    crucian_small: 50,
    roach_small: 45,
    bream_small: 20,
    crucian_large: 10,
    chub: 5,
    carp_mirror: 5,
    pike_river: 0,
    catfish_giant: 0,
    perch_small: 0,
  },
  worm: {
    gudgeon: 35,
    perch_small: 45,
    bream_small: 35,
    crucian_small: 35,
    roach_small: 20,
    crucian_large: 15,
    chub: 15,
    carp_mirror: 10,
    pike_river: 10,
    catfish_giant: 2,
  },
  maggot: {
    gudgeon: 30,
    perch_small: 40,
    bream_small: 40,
    crucian_small: 30,
    roach_small: 35,
    crucian_large: 15,
    chub: 15,
    carp_mirror: 10,
    pike_river: 5,
    catfish_giant: 0,
  },
  bloodworm: {
    gudgeon: 40,
    perch_small: 45,
    bream_small: 40,
    crucian_small: 30,
    roach_small: 40,
    crucian_large: 10,
    chub: 5,
    carp_mirror: 5,
    pike_river: 0,
    catfish_giant: 0,
  },
  corn: {
    gudgeon: 0,
    crucian_small: 0,
    roach_small: 0,
    perch_small: 0,
    bream_small: 25,
    crucian_large: 45,
    chub: 25,
    carp_mirror: 50,
    pike_river: 0,
    catfish_giant: 5,
  },
};

export function getRandomFish(
  rodStrengthKg: number = 0.45,
  lineTensileKg: number = 0.4,
  baitId: string = 'worm',
  locationWeightModifier: number = 1.0
): {
  fish: Fish;
  weight: number;
  price: number;
  exp: number;
  rodBrokenRisk: boolean;
} {
  const safeGearLimit = Math.min(rodStrengthKg, lineTensileKg);
  const baitProfile = BAIT_WEIGHTS[baitId] || BAIT_WEIGHTS['worm'];

  // Шанс 0.5% (0.005) на поклёвку рыбы с перегрузом снасти
  const isDangerousStrike = Math.random() < 0.005;

  // Фильтруем пул рыб под текущий безопасный коридор снасти
  let candidates = FISH_DATABASE.filter((f) => {
    const chance = baitProfile[f.id] || 0;
    if (chance <= 0) return false;
    if (isDangerousStrike) return true; // При опасной поклёвке доступна любая рыба из наживки
    return f.minWeight <= safeGearLimit * 1.1; // Рыба укладывается в тест снасти
  });

  if (candidates.length === 0) {
    // Резервный фоллбек на пескаря или мелкого карасика
    candidates = [FISH_DATABASE[0]];
  }

  const totalChance = candidates.reduce((sum, f) => sum + (baitProfile[f.id] || 10), 0);
  let roll = Math.random() * totalChance;
  let selectedFish = candidates[0];

  for (const f of candidates) {
    const weightChance = baitProfile[f.id] || 10;
    if (roll < weightChance) {
      selectedFish = f;
      break;
    }
    roll -= weightChance;
  }

  // Генерация веса
  let rawWeight = selectedFish.minWeight + Math.random() * (selectedFish.maxWeight - selectedFish.minWeight);
  rawWeight *= locationWeightModifier;

  // Если не опасная поклёвка, аккуратно срезаем вес по тесту снасти
  if (!isDangerousStrike && rawWeight > safeGearLimit) {
    rawWeight = Math.max(selectedFish.minWeight, safeGearLimit * (0.7 + Math.random() * 0.28));
  }

  const weight = Math.round(rawWeight * 100) / 100;
  const rodBrokenRisk = weight > safeGearLimit;

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