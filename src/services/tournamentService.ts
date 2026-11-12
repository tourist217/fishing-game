import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';
import { db, getPlayerIdentity, type PlayerIdentity } from '../firebase';

export interface LeaderboardEntry {
  id: string; // telegram_id or local test id
  name: string;
  username: string;
  bestCatchWeight: number; // кг
  totalScore: number; // кг суммарный вес
  updatedAt: number; // timestamp
  rank?: number;
}

const STORAGE_KEY_BEST = 'fg_tournament_best_catch';
const STORAGE_KEY_TOTAL = 'fg_tournament_total_score';
const STORAGE_KEY_LAST_SYNCED_BEST = 'fg_tournament_last_synced_best';

/**
 * Получить локально сохранённый рекорд игрока
 */
export function getLocalTournamentStats(): { bestCatchWeight: number; totalScore: number } {
  const best = Number(localStorage.getItem(STORAGE_KEY_BEST)) || 0;
  const total = Number(localStorage.getItem(STORAGE_KEY_TOTAL)) || 0;
  return { bestCatchWeight: best, totalScore: total };
}

/**
 * Загрузить Топ-20 игроков из коллекции "leaderboard"
 * Выполняется однократным getDocs запросом при открытии модального окна
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(leaderboardRef, orderBy('bestCatchWeight', 'desc'), limit(20));
    const snapshot = await getDocs(q);

    const entries: LeaderboardEntry[] = [];
    let rank = 1;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      entries.push({
        id: docSnap.id,
        name: data.name || 'Рыбак',
        username: data.username || '',
        bestCatchWeight: Number(data.bestCatchWeight) || 0,
        totalScore: Number(data.totalScore) || 0,
        updatedAt: Number(data.updatedAt) || 0,
        rank: rank++,
      });
    });

    return entries;
  } catch (error) {
    console.error('Ошибка при загрузке таблицы лидеров Firestore:', error);
    return [];
  }
}

/**
 * Проверить и синхронизировать запись в Firestore, если побит личный рекорд
 * Вызывается после поимки рыбы (как на поплавок, так и на фидер)
 * Оптимизация квоты: отправляет запись ТОЛЬКО при обновлении рекорда!
 */
export async function handleCatchForTournament(
  weight: number,
  _fishName?: string
): Promise<{ isNewRecord: boolean; currentBest: number }> {
  const { bestCatchWeight, totalScore } = getLocalTournamentStats();
  const newTotal = Math.round((totalScore + weight) * 1000) / 1000;
  localStorage.setItem(STORAGE_KEY_TOTAL, newTotal.toString());

  const lastSyncedBest = Number(localStorage.getItem(STORAGE_KEY_LAST_SYNCED_BEST)) || 0;
  const isNewRecord = weight > bestCatchWeight;
  const effectiveBest = Math.max(bestCatchWeight, weight);

  if (isNewRecord) {
    localStorage.setItem(STORAGE_KEY_BEST, effectiveBest.toString());
  }

  // Записываем в Firestore только если текущий рекорд превысил последний засинхронизированный
  if (effectiveBest > lastSyncedBest) {
    try {
      const identity: PlayerIdentity = getPlayerIdentity();
      const userDocRef = doc(db, 'leaderboard', identity.id);

      const payload = {
        name: identity.name,
        username: identity.username,
        bestCatchWeight: effectiveBest,
        totalScore: newTotal,
        updatedAt: Date.now(),
      };

      await setDoc(userDocRef, payload, { merge: true });
      localStorage.setItem(STORAGE_KEY_LAST_SYNCED_BEST, effectiveBest.toString());
    } catch (err) {
      console.warn('Не удалось отправить рекорд турнира в Firestore:', err);
    }
  }

  return { isNewRecord, currentBest: effectiveBest };
}

/**
 * Первоначальная инициализация или подтягивание данных текущего игрока из базы
 */
export async function syncInitialPlayerRecord(): Promise<LeaderboardEntry | null> {
  try {
    const identity = getPlayerIdentity();
    const userDocRef = doc(db, 'leaderboard', identity.id);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      const cloudBest = Number(data.bestCatchWeight) || 0;
      const cloudTotal = Number(data.totalScore) || 0;

      const local = getLocalTournamentStats();
      const maxBest = Math.max(local.bestCatchWeight, cloudBest);
      const maxTotal = Math.max(local.totalScore, cloudTotal);

      localStorage.setItem(STORAGE_KEY_BEST, maxBest.toString());
      localStorage.setItem(STORAGE_KEY_TOTAL, maxTotal.toString());
      localStorage.setItem(STORAGE_KEY_LAST_SYNCED_BEST, cloudBest.toString());

      return {
        id: identity.id,
        name: data.name || identity.name,
        username: data.username || identity.username,
        bestCatchWeight: maxBest,
        totalScore: maxTotal,
        updatedAt: Number(data.updatedAt) || Date.now(),
      };
    }
  } catch (e) {
    console.warn('Ошибка при проверке профиля в турнире:', e);
  }
  return null;
}
