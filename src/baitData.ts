export interface Bait {
  id: string;
  name: string;
  icon: string;
  pricePerPiece: number; // 1 монета за штуку
  packSize: number;      // 10 штук в пачке
  description: string;
}

export const BAITS: Bait[] = [
  {
    id: 'worm',
    name: 'Червь',
    icon: '🪱',
    pricePerPiece: 1,
    packSize: 10,
    description: 'Универсальная наживка для окуня и карася',
  },
  {
    id: 'bread',
    name: 'Хлебный мякиш',
    icon: '🍞',
    pricePerPiece: 1,
    packSize: 10,
    description: 'Любимое лакомство плотвы и некрупной мирной рыбы',
  },
  {
    id: 'dough',
    name: 'Тесто',
    icon: '🥟',
    pricePerPiece: 1,
    packSize: 10,
    description: 'Ароматная насадка для осторожного карася',
  },
  {
    id: 'maggot',
    name: 'Опарыш',
    icon: '🐛',
    pricePerPiece: 1,
    packSize: 10,
    description: 'Подвижная наживка, привлекает активную рыбу',
  },
  {
    id: 'bloodworm',
    name: 'Мотыль',
    icon: '🩸',
    pricePerPiece: 1,
    packSize: 10,
    description: 'Красный деликатес для речной мелочи и леща',
  },
  {
    id: 'corn',
    name: 'Кукуруза',
    icon: '🌽',
    pricePerPiece: 1,
    packSize: 10,
    description: 'Сладкие зёрна для крупного карася и карпа',
  },
];

// Вместимость банки на 1 вид наживки по умолчанию
export const DEFAULT_BAIT_CAPACITY = 10;

// Начальный запас наживок у нового игрока
export const INITIAL_BAIT_INVENTORY: Record<string, number> = {
  worm: 10,
  bread: 0,
  dough: 0,
  maggot: 0,
  bloodworm: 0,
  corn: 0,
};