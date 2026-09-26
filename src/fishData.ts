export type FishRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type FishSizeCategory = 'small' | 'medium' | 'large' | 'trophy';

export interface FishWeightRange {
  minKg: number;
  maxKg: number;
  priceMultiplier: number;
  expMultiplier: number;
  label: string;
}

export interface Fish {
  id: string;
  name: string;
  rarity: FishRarity;
  icon: string;
  image?: string;
  basePricePerKg: number;
  baseExpPerKg: number;
  weightTiers: Record<FishSizeCategory, FishWeightRange>;
  baitPreferences: Record<string, number>;
  fightBehavior: {
    pullForce: number;      // Сила давления ко дну (0.8 - 2.5)
    jerkFrequency: number;  // Частота рывков и прыжков зоны (0.2 - 2.0)
  };
  habitats: Record<string, FishSizeCategory[]>;
}

export interface GeneratedFishResult {
  fish: Fish;
  weight: number;
  sizeCategory: FishSizeCategory;
  categoryLabel: string;
  price: number;
  exp: number;
  rodBrokenRisk: boolean;
}

export const FISH_DATABASE: Fish[] = [
  // 1. Пескарь
  {
    id: 'gudgeon',
    name: 'Пескарь',
    rarity: 'common',
    icon: '🐟',
    image: '/fish/gudgeon.png',
    basePricePerKg: 35,
    baseExpPerKg: 120,
    weightTiers: {
      small: { minKg: 0.015, maxKg: 0.030, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленький' },
      medium: { minKg: 0.030, maxKg: 0.055, priceMultiplier: 1.3, expMultiplier: 1.3, label: 'Средний' },
      large: { minKg: 0.055, maxKg: 0.085, priceMultiplier: 1.8, expMultiplier: 1.8, label: 'Крупный' },
      trophy: { minKg: 0.085, maxKg: 0.130, priceMultiplier: 3.5, expMultiplier: 3.0, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { bloodworm: 1.0, worm: 0.8, maggot: 0.7, bread: 0.3 },
    fightBehavior: { pullForce: 0.8, jerkFrequency: 0.3 },
    habitats: {
      loc_village_pond: ['small', 'medium'],
      loc_old_oxbow: ['medium', 'large'],
      loc_quiet_river: ['large', 'trophy'],
      loc_oka_river: ['small'],
    },
  },

  // 2. Ротан
  {
    id: 'rotan',
    name: 'Ротан',
    rarity: 'common',
    icon: '🐟',
    image: '/fish/rotan.png',
    basePricePerKg: 25,
    baseExpPerKg: 90,
    weightTiers: {
      small: { minKg: 0.025, maxKg: 0.060, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленький' },
      medium: { minKg: 0.060, maxKg: 0.140, priceMultiplier: 1.3, expMultiplier: 1.2, label: 'Средний' },
      large: { minKg: 0.140, maxKg: 0.260, priceMultiplier: 1.7, expMultiplier: 1.6, label: 'Крупный' },
      trophy: { minKg: 0.260, maxKg: 0.450, priceMultiplier: 3.2, expMultiplier: 2.8, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { worm: 1.0, maggot: 0.8, livebait: 0.6 },
    fightBehavior: { pullForce: 1.1, jerkFrequency: 0.2 },
    habitats: {
      loc_village_pond: ['small'],
      loc_old_oxbow: ['medium', 'large', 'trophy'],
    },
  },

  // 3. Уклейка
  {
    id: 'bleak',
    name: 'Уклейка',
    rarity: 'common',
    icon: '🐟',
    image: '/fish/bleak.png',
    basePricePerKg: 45,
    baseExpPerKg: 140,
    weightTiers: {
      small: { minKg: 0.010, maxKg: 0.025, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленькая' },
      medium: { minKg: 0.025, maxKg: 0.045, priceMultiplier: 1.3, expMultiplier: 1.3, label: 'Средняя' },
      large: { minKg: 0.045, maxKg: 0.075, priceMultiplier: 1.9, expMultiplier: 1.8, label: 'Крупная' },
      trophy: { minKg: 0.075, maxKg: 0.115, priceMultiplier: 3.8, expMultiplier: 3.2, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { maggot: 1.0, bread: 0.9, dough: 0.8, bloodworm: 0.7 },
    fightBehavior: { pullForce: 0.7, jerkFrequency: 1.4 },
    habitats: {
      loc_old_oxbow: ['small', 'medium'],
      loc_forest_lake: ['medium'],
      loc_beaver_backwater: ['large'],
      loc_wide_reach: ['trophy'],
      loc_lower_volga: ['small'],
    },
  },

  // 4. Карась
  {
    id: 'crucian_carp',
    name: 'Карась',
    rarity: 'common',
    icon: '🐠',
    image: '/fish/crucian_carp.png',
    basePricePerKg: 20,
    baseExpPerKg: 65,
    weightTiers: {
      small: { minKg: 0.080, maxKg: 0.180, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленький' },
      medium: { minKg: 0.180, maxKg: 0.450, priceMultiplier: 1.4, expMultiplier: 1.3, label: 'Средний' },
      large: { minKg: 0.450, maxKg: 0.950, priceMultiplier: 1.9, expMultiplier: 1.7, label: 'Крупный' },
      trophy: { minKg: 0.950, maxKg: 1.850, priceMultiplier: 3.5, expMultiplier: 3.0, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { worm: 1.0, dough: 0.9, bread: 0.8, maggot: 0.7, corn: 0.5 },
    fightBehavior: { pullForce: 1.0, jerkFrequency: 0.4 },
    habitats: {
      loc_village_pond: ['small'],
      loc_old_oxbow: ['medium'],
      loc_forest_lake: ['medium', 'large', 'trophy'],
      loc_akhtuba_pits: ['small'],
    },
  },

  // 5. Плотва
  {
    id: 'roach',
    name: 'Плотва',
    rarity: 'common',
    icon: '🐟',
    image: '/fish/roach.png',
    basePricePerKg: 22,
    baseExpPerKg: 70,
    weightTiers: {
      small: { minKg: 0.050, maxKg: 0.120, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленькая' },
      medium: { minKg: 0.120, maxKg: 0.300, priceMultiplier: 1.3, expMultiplier: 1.2, label: 'Средняя' },
      large: { minKg: 0.300, maxKg: 0.650, priceMultiplier: 1.8, expMultiplier: 1.6, label: 'Крупная' },
      trophy: { minKg: 0.650, maxKg: 1.300, priceMultiplier: 3.4, expMultiplier: 3.0, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { maggot: 1.0, bloodworm: 0.9, dough: 0.8, bread: 0.7, worm: 0.6 },
    fightBehavior: { pullForce: 0.9, jerkFrequency: 0.9 },
    habitats: {
      loc_village_pond: ['small'],
      loc_old_oxbow: ['medium'],
      loc_forest_lake: ['large'],
      loc_quiet_river: ['medium', 'large', 'trophy'],
      loc_reservoir: ['small'],
      loc_ladoga_lake: ['large'],
    },
  },

  // 6. Краснопёрка
  {
    id: 'rudd',
    name: 'Краснопёрка',
    rarity: 'common',
    icon: '🐠',
    image: '/fish/rudd.png',
    basePricePerKg: 24,
    baseExpPerKg: 75,
    weightTiers: {
      small: { minKg: 0.060, maxKg: 0.140, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленькая' },
      medium: { minKg: 0.140, maxKg: 0.350, priceMultiplier: 1.3, expMultiplier: 1.3, label: 'Средняя' },
      large: { minKg: 0.350, maxKg: 0.750, priceMultiplier: 1.8, expMultiplier: 1.7, label: 'Крупная' },
      trophy: { minKg: 0.750, maxKg: 1.500, priceMultiplier: 3.5, expMultiplier: 3.0, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { corn: 1.0, maggot: 0.9, bread: 0.8, worm: 0.6 },
    fightBehavior: { pullForce: 1.0, jerkFrequency: 1.1 },
    habitats: {
      loc_quiet_river: ['small', 'medium'],
      loc_beaver_backwater: ['medium', 'large'],
      loc_wide_reach: ['large'],
      loc_reservoir: ['large', 'trophy'],
      loc_caspian_delta: ['small'],
    },
  },

  // 7. Окунь
  {
    id: 'perch',
    name: 'Окунь',
    rarity: 'rare',
    icon: '🐡',
    image: '/fish/perch.png',
    basePricePerKg: 30,
    baseExpPerKg: 95,
    weightTiers: {
      small: { minKg: 0.070, maxKg: 0.180, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленький' },
      medium: { minKg: 0.180, maxKg: 0.450, priceMultiplier: 1.4, expMultiplier: 1.4, label: 'Средний' },
      large: { minKg: 0.450, maxKg: 1.100, priceMultiplier: 2.0, expMultiplier: 1.9, label: 'Крупный' },
      trophy: { minKg: 1.100, maxKg: 2.200, priceMultiplier: 4.0, expMultiplier: 3.5, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { livebait: 1.0, worm: 0.9, bloodworm: 0.7, maggot: 0.5 },
    fightBehavior: { pullForce: 1.3, jerkFrequency: 1.3 },
    habitats: {
      loc_old_oxbow: ['small'],
      loc_forest_lake: ['medium'],
      loc_quiet_river: ['medium', 'large'],
      loc_wide_reach: ['large', 'trophy'],
      loc_ladoga_lake: ['small', 'medium'],
      loc_caspian_delta: ['large'],
    },
  },

  // 8. Линь
  {
    id: 'tench',
    name: 'Линь',
    rarity: 'rare',
    icon: '🐟',
    image: '/fish/tench.png',
    basePricePerKg: 35,
    baseExpPerKg: 110,
    weightTiers: {
      small: { minKg: 0.200, maxKg: 0.450, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленький' },
      medium: { minKg: 0.450, maxKg: 1.100, priceMultiplier: 1.4, expMultiplier: 1.3, label: 'Средний' },
      large: { minKg: 1.100, maxKg: 2.400, priceMultiplier: 2.1, expMultiplier: 1.8, label: 'Крупный' },
      trophy: { minKg: 2.400, maxKg: 4.200, priceMultiplier: 4.2, expMultiplier: 3.6, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { worm: 1.0, maggot: 0.7, corn: 0.6, dough: 0.4 },
    fightBehavior: { pullForce: 1.5, jerkFrequency: 0.3 },
    habitats: {
      loc_forest_lake: ['small', 'medium'],
      loc_beaver_backwater: ['medium', 'large', 'trophy'],
    },
  },

  // 9. Язь
  {
    id: 'ide',
    name: 'Язь',
    rarity: 'rare',
    icon: '🐟',
    image: '/fish/ide.png',
    basePricePerKg: 28,
    baseExpPerKg: 100,
    weightTiers: {
      small: { minKg: 0.250, maxKg: 0.600, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленький' },
      medium: { minKg: 0.600, maxKg: 1.400, priceMultiplier: 1.4, expMultiplier: 1.3, label: 'Средний' },
      large: { minKg: 1.400, maxKg: 2.800, priceMultiplier: 2.0, expMultiplier: 1.8, label: 'Крупный' },
      trophy: { minKg: 2.800, maxKg: 5.100, priceMultiplier: 4.0, expMultiplier: 3.4, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { corn: 1.0, maggot: 0.8, worm: 0.8, dough: 0.5 },
    fightBehavior: { pullForce: 1.4, jerkFrequency: 1.0 },
    habitats: {
      loc_quiet_river: ['small', 'medium'],
      loc_wide_reach: ['medium', 'large'],
      loc_oka_river: ['large', 'trophy'],
    },
  },

  // 10. Лещ
  {
    id: 'bream',
    name: 'Лещ',
    rarity: 'rare',
    icon: '🐠',
    image: '/fish/bream.png',
    basePricePerKg: 26,
    baseExpPerKg: 85,
    weightTiers: {
      small: { minKg: 0.200, maxKg: 0.500, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Подлещик' },
      medium: { minKg: 0.500, maxKg: 1.300, priceMultiplier: 1.4, expMultiplier: 1.3, label: 'Средний' },
      large: { minKg: 1.300, maxKg: 2.800, priceMultiplier: 2.0, expMultiplier: 1.8, label: 'Крупный' },
      trophy: { minKg: 2.800, maxKg: 5.500, priceMultiplier: 4.0, expMultiplier: 3.5, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { maggot: 1.0, worm: 0.9, bloodworm: 0.8, corn: 0.7, dough: 0.6 },
    fightBehavior: { pullForce: 1.3, jerkFrequency: 0.5 },
    habitats: {
      loc_beaver_backwater: ['small', 'medium'],
      loc_wide_reach: ['medium', 'large'],
      loc_reservoir: ['large'],
      loc_lower_volga: ['medium', 'large', 'trophy'],
      loc_akhtuba_pits: ['large'],
    },
  },

  // 11. Щука
  {
    id: 'pike',
    name: 'Щука',
    rarity: 'epic',
    icon: '🐊',
    image: '/fish/pike.png',
    basePricePerKg: 38,
    baseExpPerKg: 130,
    weightTiers: {
      small: { minKg: 0.500, maxKg: 1.200, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Травянка' },
      medium: { minKg: 1.200, maxKg: 3.200, priceMultiplier: 1.5, expMultiplier: 1.4, label: 'Средняя' },
      large: { minKg: 3.200, maxKg: 7.500, priceMultiplier: 2.3, expMultiplier: 2.0, label: 'Крупная' },
      trophy: { minKg: 7.500, maxKg: 16.000, priceMultiplier: 5.0, expMultiplier: 4.0, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { livebait: 1.0, worm: 0.2 },
    fightBehavior: { pullForce: 1.8, jerkFrequency: 1.7 },
    habitats: {
      loc_forest_lake: ['small'],
      loc_quiet_river: ['medium'],
      loc_beaver_backwater: ['medium', 'large'],
      loc_reservoir: ['large', 'trophy'],
      loc_ladoga_lake: ['large'],
    },
  },

  // 12. Судак
  {
    id: 'zander',
    name: 'Судак',
    rarity: 'epic',
    icon: '🦈',
    image: '/fish/zander.png',
    basePricePerKg: 42,
    baseExpPerKg: 140,
    weightTiers: {
      small: { minKg: 0.450, maxKg: 1.100, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленький' },
      medium: { minKg: 1.100, maxKg: 2.600, priceMultiplier: 1.5, expMultiplier: 1.4, label: 'Средний' },
      large: { minKg: 2.600, maxKg: 5.800, priceMultiplier: 2.2, expMultiplier: 2.0, label: 'Крупный' },
      trophy: { minKg: 5.800, maxKg: 11.500, priceMultiplier: 4.8, expMultiplier: 4.0, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { livebait: 1.0, worm: 0.3 },
    fightBehavior: { pullForce: 1.7, jerkFrequency: 0.8 },
    habitats: {
      loc_wide_reach: ['small', 'medium'],
      loc_reservoir: ['medium', 'large'],
      loc_oka_river: ['large'],
      loc_lower_volga: ['large', 'trophy'],
      loc_ladoga_lake: ['medium', 'large'],
      loc_caspian_delta: ['large'],
    },
  },

  // 13. Жерех
  {
    id: 'asp',
    name: 'Жерех',
    rarity: 'epic',
    icon: '🐟',
    image: '/fish/asp.png',
    basePricePerKg: 36,
    baseExpPerKg: 135,
    weightTiers: {
      small: { minKg: 0.400, maxKg: 1.000, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленький' },
      medium: { minKg: 1.000, maxKg: 2.400, priceMultiplier: 1.5, expMultiplier: 1.4, label: 'Средний' },
      large: { minKg: 2.400, maxKg: 5.200, priceMultiplier: 2.2, expMultiplier: 2.0, label: 'Крупный' },
      trophy: { minKg: 5.200, maxKg: 9.000, priceMultiplier: 4.8, expMultiplier: 4.0, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { livebait: 1.0, maggot: 0.4 },
    fightBehavior: { pullForce: 1.6, jerkFrequency: 1.8 },
    habitats: {
      loc_reservoir: ['small', 'medium'],
      loc_oka_river: ['medium', 'large'],
      loc_lower_volga: ['large'],
      loc_akhtuba_pits: ['large', 'trophy'],
    },
  },

  // 14. Карп
  {
    id: 'carp',
    name: 'Карп',
    rarity: 'epic',
    icon: '🐠',
    image: '/fish/carp.png',
    basePricePerKg: 32,
    baseExpPerKg: 115,
    weightTiers: {
      small: { minKg: 0.700, maxKg: 1.800, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленький' },
      medium: { minKg: 1.800, maxKg: 4.500, priceMultiplier: 1.5, expMultiplier: 1.4, label: 'Средний' },
      large: { minKg: 4.500, maxKg: 10.500, priceMultiplier: 2.3, expMultiplier: 2.1, label: 'Крупный' },
      trophy: { minKg: 10.500, maxKg: 22.000, priceMultiplier: 5.0, expMultiplier: 4.2, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { corn: 1.0, worm: 0.8, dough: 0.7, maggot: 0.6 },
    fightBehavior: { pullForce: 1.9, jerkFrequency: 0.7 },
    habitats: {
      loc_beaver_backwater: ['small'],
      loc_wide_reach: ['medium'],
      loc_oka_river: ['medium', 'large'],
      loc_ladoga_lake: ['large', 'trophy'],
      loc_akhtuba_pits: ['large'],
      loc_caspian_delta: ['large'],
    },
  },

  // 15. Белый амур
  {
    id: 'grass_carp',
    name: 'Белый амур',
    rarity: 'epic',
    icon: '🐟',
    image: '/fish/grass_carp.png',
    basePricePerKg: 34,
    baseExpPerKg: 125,
    weightTiers: {
      small: { minKg: 0.800, maxKg: 2.000, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленький' },
      medium: { minKg: 2.000, maxKg: 5.500, priceMultiplier: 1.5, expMultiplier: 1.4, label: 'Средний' },
      large: { minKg: 5.500, maxKg: 12.000, priceMultiplier: 2.3, expMultiplier: 2.1, label: 'Крупный' },
      trophy: { minKg: 12.000, maxKg: 25.000, priceMultiplier: 5.2, expMultiplier: 4.4, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { corn: 1.0, dough: 0.8, bread: 0.7 },
    fightBehavior: { pullForce: 1.8, jerkFrequency: 1.5 },
    habitats: {
      loc_quiet_river: ['small'],
      loc_reservoir: ['medium', 'large'],
      loc_lower_volga: ['large', 'trophy'],
      loc_caspian_delta: ['trophy'],
    },
  },

  // 16. Толстолобик
  {
    id: 'silver_carp',
    name: 'Толстолобик',
    rarity: 'epic',
    icon: '🐟',
    image: '/fish/silver_carp.png',
    basePricePerKg: 30,
    baseExpPerKg: 110,
    weightTiers: {
      small: { minKg: 1.000, maxKg: 2.500, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленький' },
      medium: { minKg: 2.500, maxKg: 6.000, priceMultiplier: 1.5, expMultiplier: 1.4, label: 'Средний' },
      large: { minKg: 6.000, maxKg: 14.000, priceMultiplier: 2.2, expMultiplier: 2.0, label: 'Крупный' },
      trophy: { minKg: 14.000, maxKg: 30.000, priceMultiplier: 5.0, expMultiplier: 4.2, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { dough: 1.0, bread: 0.8, corn: 0.6 },
    fightBehavior: { pullForce: 2.1, jerkFrequency: 0.5 },
    habitats: {
      loc_wide_reach: ['small', 'medium'],
      loc_reservoir: ['medium', 'large'],
      loc_akhtuba_pits: ['large'],
      loc_caspian_delta: ['large', 'trophy'],
    },
  },

  // 17. Сазан
  {
    id: 'wild_carp',
    name: 'Сазан',
    rarity: 'legendary',
    icon: '👑',
    basePricePerKg: 48,
    baseExpPerKg: 160,
    weightTiers: {
      small: { minKg: 1.200, maxKg: 2.800, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленький' },
      medium: { minKg: 2.800, maxKg: 6.500, priceMultiplier: 1.6, expMultiplier: 1.5, label: 'Средний' },
      large: { minKg: 6.500, maxKg: 14.000, priceMultiplier: 2.5, expMultiplier: 2.2, label: 'Крупный' },
      trophy: { minKg: 14.000, maxKg: 28.000, priceMultiplier: 6.0, expMultiplier: 5.0, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { corn: 1.0, worm: 0.8, dough: 0.6 },
    fightBehavior: { pullForce: 2.3, jerkFrequency: 1.2 },
    habitats: {
      loc_oka_river: ['small', 'medium'],
      loc_lower_volga: ['medium', 'large'],
      loc_akhtuba_pits: ['medium', 'large', 'trophy'],
      loc_caspian_delta: ['large'],
    },
  },

  // 18. Сом
  {
    id: 'wels_catfish',
    name: 'Сом',
    rarity: 'legendary',
    icon: '🐉',
    basePricePerKg: 55,
    baseExpPerKg: 200,
    weightTiers: {
      small: { minKg: 2.500, maxKg: 7.000, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Маленький' },
      medium: { minKg: 7.000, maxKg: 18.000, priceMultiplier: 1.7, expMultiplier: 1.6, label: 'Средний' },
      large: { minKg: 18.000, maxKg: 42.000, priceMultiplier: 2.8, expMultiplier: 2.5, label: 'Крупный' },
      trophy: { minKg: 42.000, maxKg: 95.000, priceMultiplier: 7.5, expMultiplier: 6.0, label: 'ТРОФЕЙ' },
    },
    baitPreferences: { livebait: 1.0, worm: 0.8 },
    fightBehavior: { pullForce: 2.5, jerkFrequency: 0.4 },
    habitats: {
      loc_lower_volga: ['small', 'medium'],
      loc_ladoga_lake: ['medium'],
      loc_akhtuba_pits: ['medium', 'large'],
      loc_caspian_delta: ['large', 'trophy'],
    },
  },
];

export const JUNK_ITEMS: Fish[] = [
  {
    id: 'junk_can',
    name: 'Консервная банка',
    rarity: 'common',
    icon: '🥫',
    basePricePerKg: 1,
    baseExpPerKg: 1,
    weightTiers: {
      small: { minKg: 0.1, maxKg: 0.2, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Мусор' },
      medium: { minKg: 0.2, maxKg: 0.3, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Мусор' },
      large: { minKg: 0.3, maxKg: 0.4, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Мусор' },
      trophy: { minKg: 0.4, maxKg: 0.5, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Мусор' },
    },
    baitPreferences: { worm: 1.0, bread: 1.0, dough: 1.0, corn: 1.0, maggot: 1.0, bloodworm: 1.0, livebait: 1.0 },
    fightBehavior: { pullForce: 0.5, jerkFrequency: 0.1 },
    habitats: {},
  },
  {
    id: 'junk_branch',
    name: 'Озёрная ветка',
    rarity: 'common',
    icon: '🪵',
    basePricePerKg: 1,
    baseExpPerKg: 1,
    weightTiers: {
      small: { minKg: 0.3, maxKg: 0.6, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Коряга' },
      medium: { minKg: 0.6, maxKg: 1.2, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Коряга' },
      large: { minKg: 1.2, maxKg: 2.5, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Коряга' },
      trophy: { minKg: 2.5, maxKg: 4.0, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Коряга' },
    },
    baitPreferences: { worm: 1.0, bread: 1.0, dough: 1.0, corn: 1.0, maggot: 1.0, bloodworm: 1.0, livebait: 1.0 },
    fightBehavior: { pullForce: 1.2, jerkFrequency: 0.1 },
    habitats: {},
  },
  {
    id: 'junk_boot',
    name: 'Старый сапог',
    rarity: 'common',
    icon: '👢',
    basePricePerKg: 1,
    baseExpPerKg: 1,
    weightTiers: {
      small: { minKg: 0.4, maxKg: 0.8, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Мусор' },
      medium: { minKg: 0.8, maxKg: 1.5, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Мусор' },
      large: { minKg: 1.5, maxKg: 2.2, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Мусор' },
      trophy: { minKg: 2.2, maxKg: 3.0, priceMultiplier: 1.0, expMultiplier: 1.0, label: 'Мусор' },
    },
    baitPreferences: { worm: 1.0, bread: 1.0, dough: 1.0, corn: 1.0, maggot: 1.0, bloodworm: 1.0, livebait: 1.0 },
    fightBehavior: { pullForce: 0.8, jerkFrequency: 0.1 },
    habitats: {},
  },
];

let lastCaughtWasTrophy = false;

// Функция подбора рыбы по водоёму, насадке и снастям
export function getRandomFish(
  rodStrengthKg: number,
  lineTensileKg: number,
  baitId: string = 'worm',
  locationId: string = 'loc_village_pond',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _locationWeightModifier: number = 1.0
): GeneratedFishResult {
  // 0. Шанс 5% поймать мусор / ветку / банку
  if (Math.random() < 0.05) {
    const junk = JUNK_ITEMS[Math.floor(Math.random() * JUNK_ITEMS.length)];
    return {
      fish: junk,
      weight: 0.35,
      sizeCategory: 'small',
      categoryLabel: 'Мусор ♻️',
      price: 1,
      exp: 1,
      rodBrokenRisk: false,
    };
  }

  // 1. Ищем всех рыб, которые водятся в этом водоёме
  let candidates = FISH_DATABASE.filter((f) => Boolean(f.habitats[locationId]));

  // Если вдруг в этой локации пусто (защита от ошибок), берём карася и плотву
  if (candidates.length === 0) {
    candidates = FISH_DATABASE.filter((f) => f.id === 'crucian_carp' || f.id === 'roach');
  }

  // 2. Взвешиваем вероятность поклёвки по наживке
  const weightedList: { fish: Fish; weight: number }[] = [];
  for (const f of candidates) {
    const pref = f.baitPreferences[baitId] || 0;
    if (pref > 0) {
      weightedList.push({ fish: f, weight: pref });
    }
  }

  // Если на выбранную наживку в этом водоёме никто не клюёт, fallback на любую доступную рыбу
  let selectedFish: Fish;
  if (weightedList.length > 0) {
    const totalWeight = weightedList.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;
    selectedFish = weightedList[0].fish;
    for (const item of weightedList) {
      rand -= item.weight;
      if (rand <= 0) {
        selectedFish = item.fish;
        break;
      }
    }
  } else {
    selectedFish = candidates[Math.floor(Math.random() * candidates.length)];
  }

  // 3. Выбираем весовую категорию, доступную строго в этом водоёме
  const availableCategories = selectedFish.habitats[locationId] || ['small'];
  let sizeCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];

  // Трофейная рыба: защита от повтора подряд + шанс < 1% (0.8%)
  if (sizeCategory === 'trophy') {
    if (lastCaughtWasTrophy || Math.random() > 0.008) {
      sizeCategory = availableCategories.includes('large') ? 'large' : 'medium';
    } else {
      lastCaughtWasTrophy = true;
    }
  } else {
    lastCaughtWasTrophy = false;
  }

  const tier = selectedFish.weightTiers[sizeCategory] || selectedFish.weightTiers.small;

  // 4. Генерируем вес особи в пределах её категории
  const rawWeight = tier.minKg + Math.random() * (tier.maxKg - tier.minKg);
  const weight = Math.round(rawWeight * 1000) / 1000;

  // 5. Расчёт стоимости и опыта
  const baseFishCost = weight * selectedFish.basePricePerKg * tier.priceMultiplier;
  const price = Math.max(1, Math.round(baseFishCost));

  const baseFishExp = weight * selectedFish.baseExpPerKg * tier.expMultiplier;
  const exp = Math.max(2, Math.round(baseFishExp));

  // 6. Проверка на риск поломки снасти
  const effectiveGearLimit = Math.min(rodStrengthKg || 0.25, lineTensileKg || 0.4);
  const rodBrokenRisk = weight > effectiveGearLimit * 0.9;

  return {
    fish: selectedFish,
    weight,
    sizeCategory,
    categoryLabel: tier.label,
    price,
    exp,
    rodBrokenRisk,
  };
}