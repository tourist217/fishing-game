/**
 * Утилита аналитики Яндекс.Метрики
 * Счётчик ID: 113819533
 */

export const YM_COUNTER_ID = 113819533;

declare global {
  interface Window {
    ym?: (counterId: number, action: string, ...args: any[]) => void;
  }
}

/**
 * Отправка достижения цели в Метрику (reachGoal)
 */
export const trackGoal = (goalName: string, params?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && typeof window.ym === 'function') {
      if (params) {
        window.ym(YM_COUNTER_ID, 'reachGoal', goalName, params);
      } else {
        window.ym(YM_COUNTER_ID, 'reachGoal', goalName);
      }
    }
  } catch (e) {
    console.debug('[Analytics] Goal error:', e);
  }
};

/**
 * Инициализация профиля пользователя (привязка Telegram ID/username или локального ID)
 */
export const initUserAnalytics = () => {
  try {
    if (typeof window === 'undefined' || typeof window.ym !== 'function') return;

    const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser) {
      const uid = String(tgUser.id);
      window.ym(YM_COUNTER_ID, 'setUserID', uid);
      window.ym(YM_COUNTER_ID, 'userParams', {
        telegram_id: tgUser.id,
        username: tgUser.username ? `@${tgUser.username}` : 'без юзернейма',
        name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '),
        language: tgUser.language_code || 'ru',
      });
    } else {
      let localId = localStorage.getItem('fg_analytics_uid');
      if (!localId) {
        localId = 'web_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('fg_analytics_uid', localId);
      }
      window.ym(YM_COUNTER_ID, 'setUserID', localId);
    }
  } catch (e) {
    console.debug('[Analytics] Init error:', e);
  }
};
