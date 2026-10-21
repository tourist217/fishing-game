import { type FishRarity, type FishSizeCategory } from '../fishData';

export type QuestDifficulty = 'easy' | 'medium' | 'hard';

export type QuestObjectiveType =
  | 'catch_any'         // Поймать N любых рыб
  | 'catch_species'     // Поймать N рыб конкретного вида (с опц. targetMinWeight)
  | 'catch_min_weight'  // Поймать рыбу весом от W кг
  | 'catch_with_bait'   // Поймать N рыб на конкретную наживку
  | 'catch_trophy'      // Поймать N трофейных рыб (со звездой)
  | 'catch_size_category' // (Legacy fallback)
  | 'catch_rarity';     // Поймать N рыб определенной редкости (rare, epic, etc.)

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  objectiveType: QuestObjectiveType;
  targetFishId?: string;
  targetFishName?: string;
  targetBaitId?: string;
  targetBaitName?: string;
  targetRarity?: FishRarity;
  targetSizeCategory?: FishSizeCategory;
  targetMinWeight?: number;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  rewardCoins: number;
  rewardExp: number;
  rewardGems?: number;
  icon: string;
}

export interface DailyQuestsState {
  date: string; // YYYY-MM-DD
  quests: DailyQuest[];
  allCompletedBonusClaimed: boolean;
}

// Минимальный уровень игрока для открытия рыбы
export const FISH_MIN_LEVELS: Record<string, number> = {
  gudgeon: 1,
  rotan: 1,
  crucian_carp: 1,
  crucian: 1,
  roach: 1,
  bleak: 3,
  perch: 3,
  tench: 6,
  pike: 6,
  rudd: 9,
  ide: 9,
  grass_carp: 9,
  bream: 12,
  carp: 12,
  zander: 15,
  silver_carp: 15,
  asp: 18,
  wild_carp: 21,
  wels_catfish: 24,
};

// Пул шаблонов заданий Егеря
export interface QuestTemplate {
  id: string;
  difficulty: QuestDifficulty;
  minPlayerLevel?: number;
  title: string;
  description: string;
  icon: string;
  objectiveType: QuestObjectiveType;
  targetFishId?: string;
  targetFishName?: string;
  targetBaitId?: string;
  targetBaitName?: string;
  targetRarity?: FishRarity;
  targetSizeCategory?: FishSizeCategory;
  targetMinWeight?: number;
  targetCount: number;
  rewardCoins: number;
  rewardExp: number;
  rewardGems?: number;
}

export const QUEST_TEMPLATES_EASY: QuestTemplate[] = [
  {
    id: 'easy_any_3',
    difficulty: 'easy',
    minPlayerLevel: 1,
    title: 'Утренняя разминка',
    description: 'Поймай 3 любые рыбы на любом водоёме',
    icon: '🎣',
    objectiveType: 'catch_any',
    targetCount: 3,
    rewardCoins: 400,
    rewardExp: 40,
  },
  {
    id: 'easy_crucian_2',
    difficulty: 'easy',
    minPlayerLevel: 1,
    title: 'Карасевый переполох',
    description: 'Поймай 2 карасей (золотых или серебряных)',
    icon: '🐟',
    objectiveType: 'catch_species',
    targetFishId: 'crucian_carp',
    targetFishName: 'Карась',
    targetCount: 2,
    rewardCoins: 450,
    rewardExp: 45,
  },
  {
    id: 'easy_roach_2',
    difficulty: 'easy',
    minPlayerLevel: 1,
    title: 'Серебристая плотва',
    description: 'Поймай 2 плотвы на хлеб или тесто',
    icon: '🐟',
    objectiveType: 'catch_species',
    targetFishId: 'roach',
    targetFishName: 'Плотва',
    targetCount: 2,
    rewardCoins: 450,
    rewardExp: 45,
  },
  {
    id: 'easy_rotan_2',
    difficulty: 'easy',
    minPlayerLevel: 1,
    title: 'Охота на ротана',
    description: 'Вылови 2 ротанов на червя',
    icon: '🐟',
    objectiveType: 'catch_species',
    targetFishId: 'rotan',
    targetFishName: 'Ротан',
    targetCount: 2,
    rewardCoins: 420,
    rewardExp: 40,
  },
  {
    id: 'easy_gudgeon_2',
    difficulty: 'easy',
    minPlayerLevel: 1,
    title: 'Пескари у мостика',
    description: 'Вылови 2 пескарей на червя или мотыля',
    icon: '🐟',
    objectiveType: 'catch_species',
    targetFishId: 'gudgeon',
    targetFishName: 'Пескарь',
    targetCount: 2,
    rewardCoins: 420,
    rewardExp: 40,
  },
  {
    id: 'easy_bait_worm_3',
    difficulty: 'easy',
    minPlayerLevel: 1,
    title: 'Классика на червя',
    description: 'Вылови 3 рыбы на обычного червя',
    icon: '🪱',
    objectiveType: 'catch_with_bait',
    targetBaitId: 'worm',
    targetBaitName: 'Червь',
    targetCount: 3,
    rewardCoins: 420,
    rewardExp: 40,
  },
  {
    id: 'easy_bait_bread_3',
    difficulty: 'easy',
    minPlayerLevel: 1,
    title: 'Хлебный мякиш',
    description: 'Вылови 3 рыбы на хлебный мякиш',
    icon: '🍞',
    objectiveType: 'catch_with_bait',
    targetBaitId: 'bread',
    targetBaitName: 'Хлеб',
    targetCount: 3,
    rewardCoins: 400,
    rewardExp: 35,
  },
  {
    id: 'easy_perch_2',
    difficulty: 'easy',
    minPlayerLevel: 3,
    title: 'Полосатый хищник',
    description: 'Вылови 2 окуней на старице',
    icon: '🐠',
    objectiveType: 'catch_species',
    targetFishId: 'perch',
    targetFishName: 'Окунь',
    targetCount: 2,
    rewardCoins: 480,
    rewardExp: 50,
  },
  {
    id: 'easy_bleak_3',
    difficulty: 'easy',
    minPlayerLevel: 3,
    title: 'Быстрая уклейка',
    description: 'Поймай 3 уклейки на хлеб или тесто',
    icon: '🐟',
    objectiveType: 'catch_species',
    targetFishId: 'bleak',
    targetFishName: 'Уклейка',
    targetCount: 3,
    rewardCoins: 450,
    rewardExp: 45,
  },
];

export const QUEST_TEMPLATES_MEDIUM: QuestTemplate[] = [
  {
    id: 'med_weight_0_6',
    difficulty: 'medium',
    minPlayerLevel: 1,
    title: 'Солидный улов',
    description: 'Вылови любую рыбу весом от 600 г',
    icon: '⚖️',
    objectiveType: 'catch_min_weight',
    targetMinWeight: 0.6,
    targetCount: 1,
    rewardCoins: 850,
    rewardExp: 80,
    rewardGems: 5,
  },
  {
    id: 'med_weight_1_0',
    difficulty: 'medium',
    minPlayerLevel: 1,
    title: 'Увесистая добыча',
    description: 'Вылови любую рыбу весом от 1.0 кг',
    icon: '⚖️',
    objectiveType: 'catch_min_weight',
    targetMinWeight: 1.0,
    targetCount: 1,
    rewardCoins: 950,
    rewardExp: 90,
    rewardGems: 6,
  },
  {
    id: 'med_bait_corn_3',
    difficulty: 'medium',
    minPlayerLevel: 1,
    title: 'Сладкая кукуруза',
    description: 'Поймай 3 рыбы на сладкую кукурузу',
    icon: '🌽',
    objectiveType: 'catch_with_bait',
    targetBaitId: 'corn',
    targetBaitName: 'Кукуруза',
    targetCount: 3,
    rewardCoins: 850,
    rewardExp: 80,
    rewardGems: 5,
  },
  {
    id: 'med_rarity_rare_2',
    difficulty: 'medium',
    minPlayerLevel: 1,
    title: 'Редкий улов',
    description: 'Поймай 2 редкие рыбы любого вида',
    icon: '✨',
    objectiveType: 'catch_rarity',
    targetRarity: 'rare',
    targetCount: 2,
    rewardCoins: 900,
    rewardExp: 90,
    rewardGems: 6,
  },
  {
    id: 'med_perch_3',
    difficulty: 'medium',
    minPlayerLevel: 3,
    title: 'Охота на полосатого',
    description: 'Поймай 3 окуней на мотыля или червя',
    icon: '🐠',
    objectiveType: 'catch_species',
    targetFishId: 'perch',
    targetFishName: 'Окунь',
    targetCount: 3,
    rewardCoins: 850,
    rewardExp: 85,
    rewardGems: 5,
  },
  {
    id: 'med_weight_1_5',
    difficulty: 'medium',
    minPlayerLevel: 3,
    title: 'Тяжёлый улов',
    description: 'Вылови любую рыбу весом от 1.5 кг',
    icon: '⚖️',
    objectiveType: 'catch_min_weight',
    targetMinWeight: 1.5,
    targetCount: 1,
    rewardCoins: 1000,
    rewardExp: 100,
    rewardGems: 6,
  },
  {
    id: 'med_tench_1',
    difficulty: 'medium',
    minPlayerLevel: 6,
    title: 'Осторожный линь',
    description: 'Поймай 1 линя на лесном озере',
    icon: '🐟',
    objectiveType: 'catch_species',
    targetFishId: 'tench',
    targetFishName: 'Линь',
    targetCount: 1,
    rewardCoins: 950,
    rewardExp: 95,
    rewardGems: 6,
  },
  {
    id: 'med_pike_1',
    difficulty: 'medium',
    minPlayerLevel: 6,
    title: 'Щучий омут',
    description: 'Вылови 1 щуку на лесном озере или старице',
    icon: '🐊',
    objectiveType: 'catch_species',
    targetFishId: 'pike',
    targetFishName: 'Щука',
    targetCount: 1,
    rewardCoins: 1100,
    rewardExp: 110,
    rewardGems: 8,
  },
  {
    id: 'med_rudd_2',
    difficulty: 'medium',
    minPlayerLevel: 9,
    title: 'Золотая краснопёрка',
    description: 'Поймай 2 краснопёрки на реке',
    icon: '🐟',
    objectiveType: 'catch_species',
    targetFishId: 'rudd',
    targetFishName: 'Краснопёрка',
    targetCount: 2,
    rewardCoins: 950,
    rewardExp: 95,
    rewardGems: 6,
  },
  {
    id: 'med_carp_1',
    difficulty: 'medium',
    minPlayerLevel: 12,
    title: 'Прудовой карп',
    description: 'Вылови 1 карпа на кукурузу или тесто',
    icon: '🌽',
    objectiveType: 'catch_species',
    targetFishId: 'carp',
    targetFishName: 'Карп',
    targetCount: 1,
    rewardCoins: 1200,
    rewardExp: 120,
    rewardGems: 8,
  },
];

export const QUEST_TEMPLATES_HARD: QuestTemplate[] = [
  {
    id: 'hard_trophy_1',
    difficulty: 'hard',
    minPlayerLevel: 1,
    title: 'Егерский трофей',
    description: 'Вылови 1 трофейную рыбу (со звездой) любого вида',
    icon: '🏆',
    objectiveType: 'catch_trophy',
    targetCount: 1,
    rewardCoins: 2500,
    rewardExp: 250,
    rewardGems: 20,
  },
  {
    id: 'hard_weight_1_5',
    difficulty: 'hard',
    minPlayerLevel: 1,
    title: 'Речной богатырь',
    description: 'Вылови любую рыбу весом от 1.5 кг',
    icon: '🏋️‍♂️',
    objectiveType: 'catch_min_weight',
    targetMinWeight: 1.5,
    targetCount: 1,
    rewardCoins: 2200,
    rewardExp: 220,
    rewardGems: 15,
  },
  {
    id: 'hard_weight_3_0',
    difficulty: 'hard',
    minPlayerLevel: 6,
    title: 'Тяжеловес',
    description: 'Вылови любую рыбу весом от 3.0 кг',
    icon: '🏋️‍♂️',
    objectiveType: 'catch_min_weight',
    targetMinWeight: 3.0,
    targetCount: 1,
    rewardCoins: 2500,
    rewardExp: 250,
    rewardGems: 18,
  },
  {
    id: 'hard_pike_weight',
    difficulty: 'hard',
    minPlayerLevel: 6,
    title: 'Озёрная щука',
    description: 'Поймай щуку весом от 1.5 кг',
    icon: '🐊',
    objectiveType: 'catch_species',
    targetFishId: 'pike',
    targetFishName: 'Щука',
    targetMinWeight: 1.5,
    targetCount: 1,
    rewardCoins: 2400,
    rewardExp: 240,
    rewardGems: 18,
  },
  {
    id: 'hard_ide_1',
    difficulty: 'hard',
    minPlayerLevel: 9,
    title: 'Хитрый язь',
    description: 'Вылови 1 язя на реке',
    icon: '🐟',
    objectiveType: 'catch_species',
    targetFishId: 'ide',
    targetFishName: 'Язь',
    targetCount: 1,
    rewardCoins: 2300,
    rewardExp: 230,
    rewardGems: 16,
  },
  {
    id: 'hard_carp_weight',
    difficulty: 'hard',
    minPlayerLevel: 12,
    title: 'Царь-карп',
    description: 'Поймай карпа весом от 3.0 кг',
    icon: '🌽',
    objectiveType: 'catch_species',
    targetFishId: 'carp',
    targetFishName: 'Карп',
    targetMinWeight: 3.0,
    targetCount: 1,
    rewardCoins: 2800,
    rewardExp: 280,
    rewardGems: 22,
  },
  {
    id: 'hard_bream_weight',
    difficulty: 'hard',
    minPlayerLevel: 12,
    title: 'Бронзовый лещ',
    description: 'Поймай леща весом от 1.5 кг',
    icon: '🐟',
    objectiveType: 'catch_species',
    targetFishId: 'bream',
    targetFishName: 'Лещ',
    targetMinWeight: 1.5,
    targetCount: 1,
    rewardCoins: 2400,
    rewardExp: 240,
    rewardGems: 18,
  },
  {
    id: 'hard_zander_1',
    difficulty: 'hard',
    minPlayerLevel: 15,
    title: 'Клыкастый судак',
    description: 'Поймай 1 судака на открытой воде',
    icon: '⚡',
    objectiveType: 'catch_species',
    targetFishId: 'zander',
    targetFishName: 'Судак',
    targetCount: 1,
    rewardCoins: 2600,
    rewardExp: 260,
    rewardGems: 20,
  },
  {
    id: 'hard_rarity_epic_1',
    difficulty: 'hard',
    minPlayerLevel: 6,
    title: 'Редкая находка',
    description: 'Поймай 1 эпическую или легендарную рыбу',
    icon: '🌟',
    objectiveType: 'catch_rarity',
    targetRarity: 'epic',
    targetCount: 1,
    rewardCoins: 2800,
    rewardExp: 300,
    rewardGems: 25,
  },
];

// Получить локальную дату в формате YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Псевдослучайный генератор по сиду (числовому хешу даты)
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Сгенерировать 3 ежедневных квеста для заданной даты с учётом уровня игрока
export function generateDailyQuests(dateStr: string, playerLevel: number = 1): DailyQuest[] {
  const seed = stringToSeed(dateStr);

  const availableEasy = QUEST_TEMPLATES_EASY.filter((t) => (t.minPlayerLevel || 1) <= playerLevel);
  const availableMed = QUEST_TEMPLATES_MEDIUM.filter((t) => (t.minPlayerLevel || 1) <= playerLevel);
  const availableHard = QUEST_TEMPLATES_HARD.filter((t) => (t.minPlayerLevel || 1) <= playerLevel);

  const poolEasy = availableEasy.length > 0 ? availableEasy : QUEST_TEMPLATES_EASY;
  const poolMed = availableMed.length > 0 ? availableMed : QUEST_TEMPLATES_MEDIUM;
  const poolHard = availableHard.length > 0 ? availableHard : QUEST_TEMPLATES_HARD;

  const easyIdx = Math.floor(pseudoRandom(seed + 1) * poolEasy.length);
  const medIdx = Math.floor(pseudoRandom(seed + 2) * poolMed.length);
  const hardIdx = Math.floor(pseudoRandom(seed + 3) * poolHard.length);

  const tEasy = poolEasy[easyIdx];
  const tMed = poolMed[medIdx];
  const tHard = poolHard[hardIdx];

  const mapToQuest = (t: QuestTemplate): DailyQuest => ({
    id: `${dateStr}_${t.id}`,
    title: t.title,
    description: t.description,
    difficulty: t.difficulty,
    objectiveType: t.objectiveType,
    targetFishId: t.targetFishId,
    targetFishName: t.targetFishName,
    targetBaitId: t.targetBaitId,
    targetBaitName: t.targetBaitName,
    targetRarity: t.targetRarity,
    targetSizeCategory: t.targetSizeCategory,
    targetMinWeight: t.targetMinWeight,
    targetCount: t.targetCount,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    rewardCoins: t.rewardCoins,
    rewardExp: t.rewardExp,
    rewardGems: t.rewardGems,
    icon: t.icon,
  });

  return [mapToQuest(tEasy), mapToQuest(tMed), mapToQuest(tHard)];
}

// Супер-награда за все 3 выполненных квеста дня
export const DAILY_BONUS_REWARD = {
  coins: 1500,
  exp: 150,
  gems: 25,
};
