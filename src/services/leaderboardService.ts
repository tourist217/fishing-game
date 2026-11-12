import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

export interface GlobalLeaderboardEntry {
  id: string;
  name: string;
  level: number;
  exp: number;
  totalCaughtWeight: number; // кг
  trophiesCount: number;
  rank: number;
}

export type LeaderboardSortBy = 'level' | 'totalWeight';

/**
 * Получить Топ-20 игроков зала славы
 */
export async function fetchGlobalLeaderboard(
  sortBy: LeaderboardSortBy = 'level'
): Promise<GlobalLeaderboardEntry[]> {
  try {
    const usersRef = collection(db, 'users');
    const sortField = sortBy === 'level' ? 'level' : 'totalCaughtWeight';
    const q = query(usersRef, orderBy(sortField, 'desc'), limit(20));

    const snapshot = await getDocs(q);
    const list: GlobalLeaderboardEntry[] = [];
    let rank = 1;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        name: data.name || 'Рыбак',
        level: Number(data.level) || 1,
        exp: Number(data.exp) || 0,
        totalCaughtWeight: Number(data.totalCaughtWeight) || 0,
        trophiesCount: Number(data.trophiesCount) || 0,
        rank: rank++,
      });
    });

    return list;
  } catch (err) {
    console.warn('Ошибка при загрузке глобального лидерборда:', err);
    return [];
  }
}
