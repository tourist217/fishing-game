export interface Bait {
  id: string;
  name: string;
  icon: string;
  price: number; // цена за пачку из 5 шт
  description: string;
}

export const BAITS: Bait[] = [
  {
    id: 'worm',
    name: 'Червь навозный',
    icon: '🪱',
    price: 5, // 1 монета за 1 шт (пачка 5 шт = 5 монет)
    description: 'Универсальная наживка для большинства мирных и мелких хищных рыб.',
  },
  {
    id: 'bread',
    name: 'Хлебный мякиш',
    icon: '🍞',
    price: 5, // 1 монета за 1 шт
    description: 'Любимое лакомство плотвы и некрупного карася.',
  },
  {
    id: 'dough',
    name: 'Манное тесто',
    icon: '🥟',
    price: 10,
    description: 'Привлекает осторожного карася и речного голавля.',
  },
  {
    id: 'maggot',
    name: 'Опарыш',
    icon: '🐛',
    price: 15,
    description: 'Отличная подвижная наживка для ловли подлещика и окуня.',
  },
  {
    id: 'bloodworm',
    name: 'Мотыль',
    icon: '🪱',
    price: 20,
    description: 'Нежный деликатес для капризного клёва.',
  },
  {
    id: 'corn',
    name: 'Сладкая кукуруза',
    icon: '🌽',
    price: 30,
    description: 'Лакомство крупного карася и карпа.',
  },
];

export const INITIAL_BAIT_INVENTORY: Record<string, number> = {
  worm: 10,
  bread: 5,
  dough: 0,
  maggot: 0,
  bloodworm: 0,
  corn: 0,
};