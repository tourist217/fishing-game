export interface Fish {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  minWeight: number; // в кг
  maxWeight: number;
  basePrice: number; // монеты за кг
  baseExp: number;
}

export const FISH_LIST: Fish[] = [
  {
    id: 'perch',
    name: 'Окунь',
    icon: '🐟',
    rarity: 'common',
    minWeight: 0.15,
    maxWeight: 1.2,
    basePrice: 10,
    baseExp: 15,
  },
  {
    id: 'crucian',
    name: 'Карась',
    icon: '🐠',
    rarity: 'common',
    minWeight: 0.2,
    maxWeight: 1.5,
    basePrice: 12,
    baseExp: 18,
  },
  {
    id: 'pike',
    name: 'Щука',
    icon: '🐊',
    rarity: 'rare',
    minWeight: 1.0,
    maxWeight: 6.5,
    basePrice: 25,
    baseExp: 45,
  },
  {
    id: 'carp',
    name: 'Сазан',
    icon: '🐡',
    rarity: 'rare',
    minWeight: 1.5,
    maxWeight: 8.0,
    basePrice: 30,
    baseExp: 55,
  },
  {
    id: 'catfish',
    name: 'Сом',
    icon: '🐋',
    rarity: 'epic',
    minWeight: 4.0,
    maxWeight: 25.0,
    basePrice: 60,
    baseExp: 120,
  },
  {
    id: 'golden_carp',
    name: 'Золотая рыбка',
    icon: '✨',
    rarity: 'legendary',
    minWeight: 0.5,
    maxWeight: 2.0,
    basePrice: 250,
    baseExp: 300,
  },
];

// Функция случайного выбора рыбы с учетом шансов
export function getRandomFish(): { fish: Fish; weight: number; price: number; exp: number } {
  const rand = Math.random() * 100;
  let pool = FISH_LIST.filter(f => f.rarity === 'common');

  if (rand < 5) {
    // 5% шанс на легендарку
    pool = FISH_LIST.filter(f => f.rarity === 'legendary');
  } else if (rand < 20) {
    // 15% шанс на эпик
    pool = FISH_LIST.filter(f => f.rarity === 'epic');
  } else if (rand < 50) {
    // 30% шанс на редкую
    pool = FISH_LIST.filter(f => f.rarity === 'rare');
  }

  const selectedFish = pool[Math.floor(Math.random() * pool.length)] || FISH_LIST[0];
  const weight = Number((Math.random() * (selectedFish.maxWeight - selectedFish.minWeight) + selectedFish.minWeight).toFixed(2));
  const price = Math.round(weight * selectedFish.basePrice);
  const exp = Math.round(weight * selectedFish.baseExp);

  return {
    fish: selectedFish,
    weight,
    price,
    exp,
  };
}