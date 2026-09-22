export interface Fish {
  id: string;
  name: string;
  minWeight: number; // кг
  maxWeight: number; // кг
  basePrice: number; // монет за кг
  baseExp: number;   // опыта за кг
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  minRodReq: number; // Минимальный требуемый уровень удочки (1 - бамбук, 2 - стеклопластик, 3 - карбон, 4 - титан)
}

export const FISH_DATABASE: Fish[] = [
  // Рыбы стартового пруда (удочка 1 уровня: Бамбук)
  {
    id: 'perch_small',
    name: 'Окушок',
    minWeight: 0.1,
    maxWeight: 0.45,
    basePrice: 18,
    baseExp: 22,
    rarity: 'common',
    icon: '🐟',
    minRodReq: 1,
  },
  {
    id: 'crucian',
    name: 'Карась',
    minWeight: 0.2,
    maxWeight: 0.9,
    basePrice: 15,
    baseExp: 18,
    rarity: 'common',
    icon: '🐠',
    minRodReq: 1,
  },
  {
    id: 'roach',
    name: 'Плотва',
    minWeight: 0.15,
    maxWeight: 0.6,
    basePrice: 20,
    baseExp: 25,
    rarity: 'common',
    icon: '🐟',
    minRodReq: 1,
  },

  // Рыбы для стеклопластика (удочка 2 уровня)
  {
    id: 'bream',
    name: 'Подлещик',
    minWeight: 0.8,
    maxWeight: 2.2,
    basePrice: 35,
    baseExp: 35,
    rarity: 'rare',
    icon: '🐡',
    minRodReq: 2,
  },
  {
    id: 'pike_small',
    name: 'Щучка-травянка',
    minWeight: 1.0,
    maxWeight: 2.8,
    basePrice: 50,
    baseExp: 45,
    rarity: 'rare',
    icon: '🦈',
    minRodReq: 2,
  },

  // Рыбы для карбонового спиннинга (удочка 3 уровня)
  {
    id: 'pike_large',
    name: 'Глубинная Щука',
    minWeight: 3.0,
    maxWeight: 7.5,
    basePrice: 75,
    baseExp: 60,
    rarity: 'epic',
    icon: '🦈',
    minRodReq: 3,
  },
  {
    id: 'carp',
    name: 'Дикий Сазан',
    minWeight: 3.5,
    maxWeight: 9.0,
    basePrice: 85,
    baseExp: 70,
    rarity: 'epic',
    icon: '🐡',
    minRodReq: 3,
  },

  // Рыбы для титановой снасти (удочка 4 уровня)
  {
    id: 'catfish',
    name: 'Речной Сом',
    minWeight: 8.0,
    maxWeight: 25.0,
    basePrice: 120,
    baseExp: 90,
    rarity: 'legendary',
    icon: '🐋',
    minRodReq: 4,
  },
];

// Подбор рыбы с учетом уровня удочки игрока
export function getRandomFish(playerRodLevel: number = 1): {
  fish: Fish;
  weight: number;
  price: number;
  exp: number;
} {
  // Фильтруем: выпадают только те рыбы, которые по зубам текущей удочке
  const availableFish = FISH_DATABASE.filter((f) => f.minRodReq <= playerRodLevel);

  // Случайный выбор рыбы из доступных
  const randomIndex = Math.floor(Math.random() * availableFish.length);
  const fish = availableFish[randomIndex];

  // Случайный вес с точностью до 1 знака (например, 0.42 -> 0.4 кг)
  const rawWeight = fish.minWeight + Math.random() * (fish.maxWeight - fish.minWeight);
  const weight = Math.round(rawWeight * 100) / 100;

  // Формула цены и опыта
  const price = Math.max(1, Math.round(weight * fish.basePrice));
  const exp = Math.max(5, Math.round(weight * fish.baseExp));

  return { fish, weight, price, exp };
}