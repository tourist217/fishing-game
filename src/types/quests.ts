import { type FishRarity, type FishSizeCategory } from '../fishData';

export type QuestDifficulty = 'easy' | 'medium' | 'hard';

export type QuestObjectiveType =
  | 'catch_any'         // Поймать N любых рыб
  | 'catch_species'     // Поймать N рыб конкретного вида
  | 'catch_min_weight'  // Поймать рыбу весом от W кг
  | 'catch_with_bait'   // Поймать N рыб на конкретную наживку
  | 'catch_size_category' // Поймать N рыб категории (medium, large, trophy)
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

// Пул шаблонов заданий Егеря
export interface QuestTemplate {
  id: string;
  difficulty: QuestDifficulty;
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
    title: 'Карасевый переполох',
    description: 'Поймай 2 карасей (золотых или серебряных)',
    icon: '🐟',
    objectiveType: 'catch_species',
    targetFishId: 'crucian',
    targetFishName: 'Карась',
    targetCount: 2,
    rewardCoins: 450,
    rewardExp: 45,
  },
  {
    id: 'easy_bait_worm_3',
    difficulty: 'easy',
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
    id: 'easy_roach_2',
    difficulty: 'easy',
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
    id: 'easy_bait_bread_3',
    difficulty: 'easy',
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
];

export const QUEST_TEMPLATES_MEDIUM: QuestTemplate[] = [
  {
    id: 'med_weight_1_5',
    difficulty: 'medium',
    title: 'Увесистый улов',
    description: 'Вылови любую рыбу весом от 1.5 кг',
    icon: '⚖️',
    objectiveType: 'catch_min_weight',
    targetMinWeight: 1.5,
    targetCount: 1,
    rewardCoins: 900,
    rewardExp: 90,
    rewardGems: 5,
  },
  {
    id: 'med_perch_2',
    difficulty: 'medium',
    title: 'Охота на полосатого',
    description: 'Поймай 2 окуней на мотыля или живца',
    icon: '🐠',
    objectiveType: 'catch_species',
    targetFishId: 'perch',
    targetFishName: 'Окунь',
    targetCount: 2,
    rewardCoins: 850,
    rewardExp: 85,
    rewardGems: 5,
  },
  {
    id: 'med_carp_1',
    difficulty: 'medium',
    title: 'Прудовой карп',
    description: 'Вылови 1 карпа на кукурузу или тесто',
    icon: '🌽',
    objectiveType: 'catch_species',
    targetFishId: 'carp',
    targetFishName: 'Карп',
    targetCount: 1,
    rewardCoins: 950,
    rewardExp: 100,
    rewardGems: 6,
  },
  {
    id: 'med_size_large_1',
    difficulty: 'medium',
    title: 'Крупный калибр',
    description: 'Вылови 1 рыбу категории «Крупная» или выше',
    icon: '📏',
    objectiveType: 'catch_size_category',
    targetSizeCategory: 'large',
    targetCount: 1,
    rewardCoins: 1000,
    rewardExp: 110,
    rewardGems: 8,
  },
  {
    id: 'med_bait_corn_3',
    difficulty: 'medium',
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
];

export const QUEST_TEMPLATES_HARD: QuestTemplate[] = [
  {
    id: 'hard_trophy_1',
    difficulty: 'hard',
    title: 'Егерский трофей',
    description: 'Вылови 1 трофейную рыбу любого вида',
    icon: '🏆',
    objectiveType: 'catch_size_category',
    targetSizeCategory: 'trophy',
    targetCount: 1,
    rewardCoins: 2500,
    rewardExp: 250,
    rewardGems: 20,
  },
  {
    id: 'hard_pike_weight',
    difficulty: 'hard',
    title: 'Речная разбойница',
    description: 'Поймай щуку весом от 2.0 кг',
    icon: '🐊',
    objectiveType: 'catch_species',
    targetFishId: 'pike',
    targetFishName: 'Щука',
    targetMinWeight: 2.0,
    targetCount: 1,
    rewardCoins: 2200,
    rewardExp: 220,
    rewardGems: 15,
  },
  {
    id: 'hard_zander_1',
    difficulty: 'hard',
    title: 'Клыкастый судак',
    description: 'Поймай 1 судака на глубоких участках реки',
    icon: '⚡',
    objectiveType: 'catch_species',
    targetFishId: 'zander',
    targetFishName: 'Судак',
    targetCount: 1,
    rewardCoins: 2000,
    rewardExp: 200,
    rewardGems: 15,
  },
  {
    id: 'hard_rarity_epic_1',
    difficulty: 'hard',
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
  {
    id: 'hard_weight_3_0',
    difficulty: 'hard',
    title: 'Тяжеловес',
    description: 'Вылови любую рыбу весом от 3.0 кг',
    icon: '🏋️‍♂️',
    objectiveType: 'catch_min_weight',
    targetMinWeight: 3.0,
    targetCount: 1,
    rewardCoins: 2400,
    rewardExp: 240,
    rewardGems: 18,
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

// Сгенерировать 3 ежедневных квеста для заданной даты
export function generateDailyQuests(dateStr: string): DailyQuest[] {
  const seed = stringToSeed(dateStr);

  const easyIdx = Math.floor(pseudoRandom(seed + 1) * QUEST_TEMPLATES_EASY.length);
  const medIdx = Math.floor(pseudoRandom(seed + 2) * QUEST_TEMPLATES_MEDIUM.length);
  const hardIdx = Math.floor(pseudoRandom(seed + 3) * QUEST_TEMPLATES_HARD.length);

  const tEasy = QUEST_TEMPLATES_EASY[easyIdx];
  const tMed = QUEST_TEMPLATES_MEDIUM[medIdx];
  const tHard = QUEST_TEMPLATES_HARD[hardIdx];

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
