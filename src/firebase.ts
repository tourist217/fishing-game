import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2o5XgG4aZeq8gvdBWr1kYobVED3dmEbs",
  authDomain: "fishing-game-97536.firebaseapp.com",
  projectId: "fishing-game-97536",
  storageBucket: "fishing-game-97536.firebasestorage.app",
  messagingSenderId: "288013225468",
  appId: "1:288013225468:web:4619585c67fbfff2ead679"
};

// Singleton initialization of Firebase App and Firestore
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export interface PlayerIdentity {
  id: string;
  name: string;
  username: string;
  isTest: boolean;
}

/**
 * Получить или сгенерировать стабильный ID и данные текущего игрока
 * Если игра запущена в Telegram — берём данные из WebApp
 * Если локально/в браузере — берём или создаём постоянный ID в localStorage
 */
export function getPlayerIdentity(): PlayerIdentity {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  if (tgUser && tgUser.id) {
    const firstName = tgUser.first_name || '';
    const lastName = tgUser.last_name || '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Рыбак';
    const username = tgUser.username ? `@${tgUser.username}` : '';

    return {
      id: String(tgUser.id),
      name: fullName,
      username,
      isTest: false,
    };
  }

  // Fallback для локального тестирования вне Telegram
  let localId = localStorage.getItem('fg_player_id');
  let localName = localStorage.getItem('fg_player_name');

  if (!localId) {
    localId = `local_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    localStorage.setItem('fg_player_id', localId);
  }

  if (!localName) {
    localName = 'Тестовый Рыбак';
    localStorage.setItem('fg_player_name', localName);
  }

  return {
    id: localId,
    name: localName,
    username: '@local_test',
    isTest: true,
  };
}
