export type CurrencyType = 'coins' | 'gems';

// --- УДИЛИЩА ---
export interface RodTier {
  id: string;
  name: string;
  icon: string;
  material: 'reed' | 'bamboo' | 'plastic' | 'fiberglass' | 'composite' | 'carbon' | 'titanium' | 'gold';
  baseStrengthKg: number; // прочность на 1 уровне
  maxStrengthKg: number;  // прочность на 5 уровне
  canMountReel: boolean;  // камыш = false, остальные = true
  levelReq: number;       // требуемый уровень профиля
  basePrice: number;
  currency: CurrencyType;
  description: string;
}

export const ROD_TIERS: RodTier[] = [
  {
    id: 'rod_reed',
    name: 'Камышовое удилище',
    icon: '🎋',
    material: 'reed',
    baseStrengthKg: 0.25,
    maxStrengthKg: 0.45,
    canMountReel: false,
    levelReq: 1,
    basePrice: 0,
    currency: 'coins',
    description: 'Глухая снасть без катушки. Идеальна для ловли мелкой плотвы и карасиков у берега.',
  },
  {
    id: 'rod_bamboo',
    name: 'Бамбуковая удочка',
    icon: '🎍',
    material: 'bamboo',
    baseStrengthKg: 0.45,
    maxStrengthKg: 1.0,
    canMountReel: true,
    levelReq: 1,
    basePrice: 150,
    currency: 'coins',
    description: 'Классическое удилище с пропускными кольцами. Можно установить первую катушку.',
  },
  {
    id: 'rod_plastic',
    name: 'Телескопическая удочка',
    icon: '🎣',
    material: 'plastic',
    baseStrengthKg: 1.0,
    maxStrengthKg: 2.5,
    canMountReel: true,
    levelReq: 3,
    basePrice: 600,
    currency: 'coins',
    description: 'Универсальный пластиковый телескоп. Выдерживает активную борьбу с подлещиком.',
  },
  {
    id: 'rod_fiberglass',
    name: 'Стеклопластиковый фидер',
    icon: '🥢',
    material: 'fiberglass',
    baseStrengthKg: 2.5,
    maxStrengthKg: 5.5,
    canMountReel: true,
    levelReq: 5,
    basePrice: 1800,
    currency: 'coins',
    description: 'Гибкий и вязкий бланк, отлично гасит рывки крупного золотого карася и карпа.',
  },
  {
    id: 'rod_composite',
    name: 'Композитный спиннинг',
    icon: '🪄',
    material: 'composite',
    baseStrengthKg: 5.5,
    maxStrengthKg: 11.0,
    canMountReel: true,
    levelReq: 8,
    basePrice: 4500,
    currency: 'coins',
    description: 'Мощный сплав карбона и стекловолокна для трофейных речных хищников.',
  },
  {
    id: 'rod_carbon',
    name: 'Карбоновый бланк High-End',
    icon: '⚡',
    material: 'carbon',
    baseStrengthKg: 11.0,
    maxStrengthKg: 22.0,
    canMountReel: true,
    levelReq: 12,
    basePrice: 12000,
    currency: 'coins',
    description: 'Легчайший звонкий углепластик с колоссальным запасом прочности на излом.',
  },
  {
    id: 'rod_gold',
    name: 'Золотое удилище Мастера',
    icon: '👑',
    material: 'gold',
    baseStrengthKg: 25.0,
    maxStrengthKg: 55.0,
    canMountReel: true,
    levelReq: 10,
    basePrice: 250,
    currency: 'gems',
    description: 'Премиальный статус. Позволяет доставать реликтовых речных чудовищ свыше 50 кг.',
  },
];

// Функция расчёта текущей прочности бланка по его уровню (1..5)
export function getRodStrength(rod: RodTier, currentLevel: number): number {
  if (currentLevel <= 1) return rod.baseStrengthKg;
  const progress = Math.min(4, Math.max(0, currentLevel - 1)) / 4;
  const result = rod.baseStrengthKg + progress * (rod.maxStrengthKg - rod.baseStrengthKg);
  return Math.round(result * 100) / 100;
}

// Стоимость улучшения удилища на следующий уровень
export function getRodUpgradeCost(rod: RodTier, nextLevel: number): number {
  if (rod.currency === 'gems') {
    return nextLevel * 50;
  }
  return Math.round(rod.basePrice * 0.35 * nextLevel);
}

// --- КАТУШКИ ---
export interface ReelTier {
  id: string;
  name: string;
  icon: string;
  size: 1000 | 2000 | 3000 | 5000 | 8000;
  basePullSpeed: number; // множитель скорости смотки (1.0 = базовая)
  maxPullSpeed: number;  // скорость на 3 уровне
  levelReq: number;
  basePrice: number;
  currency: CurrencyType;
  description: string;
}

export const REEL_TIERS: ReelTier[] = [
  {
    id: 'reel_1000',
    name: 'Катушка 1000 «Лесная»',
    icon: '⚙️',
    size: 1000,
    basePullSpeed: 1.15,
    maxPullSpeed: 1.35,
    levelReq: 2,
    basePrice: 200,
    currency: 'coins',
    description: 'Компактная катушка под лёгкую оснастку. Небольшой бонус к скорости вымотки.',
  },
  {
    id: 'reel_2000',
    name: 'Катушка 2000 «Озёрная»',
    icon: '⚙️',
    size: 2000,
    basePullSpeed: 1.4,
    maxPullSpeed: 1.7,
    levelReq: 4,
    basePrice: 850,
    currency: 'coins',
    description: 'Надёжный плавный фрикцион. Легко гасит рывки рыбы среднего веса.',
  },
  {
    id: 'reel_3000',
    name: 'Катушка 3000 «Речной вихрь»',
    icon: '🔩',
    size: 3000,
    basePullSpeed: 1.8,
    maxPullSpeed: 2.2,
    levelReq: 7,
    basePrice: 2400,
    currency: 'coins',
    description: 'Усиленная передача для ловли на быстром течении и глубоких ямах.',
  },
  {
    id: 'reel_5000',
    name: 'Силовая катушка 5000',
    icon: '🪨',
    size: 5000,
    basePullSpeed: 2.3,
    maxPullSpeed: 2.8,
    levelReq: 11,
    basePrice: 7000,
    currency: 'coins',
    description: 'Тяговитый механизм для форсированного вываживания гигантов.',
  },
  {
    id: 'reel_8000',
    name: 'Морской титан 8000',
    icon: '🔱',
    size: 8000,
    basePullSpeed: 2.9,
    maxPullSpeed: 3.5,
    levelReq: 10,
    basePrice: 200,
    currency: 'gems',
    description: 'Премиальный механизм. Максимальная тяга и вымотка крупной рыбы.',
  },
];

export function getReelPullSpeed(reel: ReelTier, currentLevel: number): number {
  if (currentLevel <= 1) return reel.basePullSpeed;
  const progress = Math.min(2, Math.max(0, currentLevel - 1)) / 2;
  const result = reel.basePullSpeed + progress * (reel.maxPullSpeed - reel.basePullSpeed);
  return Math.round(result * 100) / 100;
}

export function getReelUpgradeCost(reel: ReelTier, nextLevel: number): number {
  if (reel.currency === 'gems') {
    return nextLevel * 45;
  }
  return Math.round(reel.basePrice * 0.45 * nextLevel);
}

// --- ЛЕСКИ (РАСХОДНИКИ) ---
export interface LineTier {
  id: string;
  name: string;
  icon: string;
  maxTensileKg: number; // разрывная нагрузка в кг
  levelReq: number;     // ограничение по уровню профиля
  price: number;
  currency: CurrencyType;
  description: string;
}

export const LINE_TIERS: LineTier[] = [
  {
    id: 'line_010',
    name: 'Монофил 0.10 мм (до 0.4 кг)',
    icon: '🧵',
    maxTensileKg: 0.4,
    levelReq: 1,
    price: 15,
    currency: 'coins',
    description: 'Тонкая незаметная леска для ловли осторожной мелочи.',
  },
  {
    id: 'line_014',
    name: 'Монофил 0.14 мм (до 1.0 кг)',
    icon: '🧵',
    maxTensileKg: 1.0,
    levelReq: 2,
    price: 45,
    currency: 'coins',
    description: 'Надёжная леска для стандартной бамбуковой удочки.',
  },
  {
    id: 'line_020',
    name: 'Леска Pro 0.20 мм (до 2.5 кг)',
    icon: '🧶',
    maxTensileKg: 2.5,
    levelReq: 3,
    price: 120,
    currency: 'coins',
    description: 'Оптимальный баланс прочности и растяжимости для карасей.',
  },
  {
    id: 'line_028',
    name: 'Усиленный шнур (до 5.0 кг)',
    icon: '🧶',
    maxTensileKg: 5.0,
    levelReq: 5,
    price: 350,
    currency: 'coins',
    description: 'Плотное сечение, держит рывки сильной прудовой рыбы.',
  },
  {
    id: 'line_035',
    name: 'Карповый шнур (до 10.0 кг)',
    icon: '🪢',
    maxTensileKg: 10.0,
    levelReq: 8,
    price: 900,
    currency: 'coins',
    description: 'Абразивостойкая силовая нить для глубоководной ловли.',
  },
  {
    id: 'line_braid_025',
    name: 'Плетёнка 8X (до 20.0 кг)',
    icon: '🪢',
    maxTensileKg: 20.0,
    levelReq: 12,
    price: 2500,
    currency: 'coins',
    description: 'Восьмижильный плетеный шнур с нулевой растяжимостью.',
  },
  {
    id: 'line_titan_50',
    name: 'Титановый корд (до 50.0 кг)',
    icon: '✨',
    maxTensileKg: 50.0,
    levelReq: 10,
    price: 60,
    currency: 'gems',
    description: 'Премиум-нить экстремальной прочности под любых озерных чудовищ.',
  },
];

// Начальное состояние снаряжения для нового игрока
export interface PlayerGearState {
  equippedRodId: string;
  rodLevels: Record<string, number>;    // id удилища -> уровень (1..5)
  ownedRods: string[];
  
  equippedReelId: string | null;        // null если камышовая удочка
  reelLevels: Record<string, number>;   // id катушки -> уровень (1..3)
  ownedReels: string[];
  
  equippedLineId: string;
  lineStock: Record<string, number>;    // запас катушек лески в инвентаре
}

export const INITIAL_PLAYER_GEAR: PlayerGearState = {
  equippedRodId: 'rod_reed',
  rodLevels: { rod_reed: 1 },
  ownedRods: ['rod_reed'],
  equippedReelId: null,
  reelLevels: {},
  ownedReels: [],
  equippedLineId: 'line_010',
  lineStock: { line_010: 2 },
};