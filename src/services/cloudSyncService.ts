import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, getPlayerIdentity } from '../firebase';
import type { CaughtFishItem } from '../components/InventoryScreen';
import type { FishJournal } from '../hooks/usePlayerState';
import type { PlayerGearState } from '../gearData';
import type { UpgradesState } from '../hooks/useBaitState';
import type { FeederSlotData } from '../hooks/useFeederState';

export interface CloudUserProfile {
  id: string; // telegram_id or local test id
  name: string;
  coins: number;
  exp: number;
  level: number;
  gems: number;
  energy: number;
  lastEnergyTimestamp: number;
  inventory: CaughtFishItem[];
  journal: FishJournal;
  hasClaimedAllSpeciesReward: boolean;
  gear: PlayerGearState;
  baits: Record<string, number>;
  upgrades: UpgradesState;
  selectedBaitId: string;
  feeders: FeederSlotData[];
  totalCaughtWeight: number; // кг за всё время
  trophiesCount: number;
  updatedAt: number; // timestamp
}

const STORAGE_KEY_PROFILE_UPDATED = 'fg_profile_last_updated';
const STORAGE_KEY_TOTAL_WEIGHT = 'fg_tournament_total_score';

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let latestProfileGetter: (() => CloudUserProfile) | null = null;

/**
 * Загрузить облачный профиль игрока из Firestore
 */
export async function loadCloudUserProfile(): Promise<CloudUserProfile | null> {
  try {
    const identity = getPlayerIdentity();
    const userRef = doc(db, 'users', identity.id);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return snap.data() as CloudUserProfile;
    }
  } catch (err) {
    console.warn('Не удалось загрузить облачный профиль:', err);
  }
  return null;
}

/**
 * Отправить актуальный профиль в Firestore
 */
export async function saveCloudUserProfile(profile: CloudUserProfile): Promise<void> {
  try {
    const identity = getPlayerIdentity();
    const userRef = doc(db, 'users', identity.id);

    // Гарантируем корректное имя и ID
    const cleanProfile: CloudUserProfile = {
      ...profile,
      id: identity.id,
      name: identity.name,
      updatedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY_PROFILE_UPDATED, cleanProfile.updatedAt.toString());

    await setDoc(userRef, cleanProfile, { merge: true });
  } catch (err) {
    console.warn('Ошибка при сохранении облачного профиля:', err);
  }
}

/**
 * Планировщик авто-сохранения с debounce (3 секунды)
 * Исключает спам запросов к Firestore при частых действиях
 */
export function scheduleDebouncedCloudSync(getProfile: () => CloudUserProfile): void {
  latestProfileGetter = getProfile;
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(() => {
    const profile = getProfile();
    saveCloudUserProfile(profile);
  }, 3000);
}

/**
 * Мгновенное сохранение (при закрытии приложения или перед открытием лидерборда)
 */
export async function flushImmediateCloudSync(getProfile?: () => CloudUserProfile): Promise<void> {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
    syncTimeout = null;
  }
  const getter = getProfile || latestProfileGetter;
  if (getter) {
    await saveCloudUserProfile(getter());
  }
}

/**
 * Получить суммарный выловленный вес рыбы за всё время
 */
export function getTotalCaughtWeight(): number {
  return Number(localStorage.getItem(STORAGE_KEY_TOTAL_WEIGHT)) || 0;
}
