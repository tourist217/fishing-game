import type { ActiveFishState } from '../hooks/useFishingSimulation';
import { formatWeight } from './fishUtils';

const SHARE_STORAGE_KEY = 'fg_daily_shares';
export const MAX_DAILY_SHARES = 5;
export const SHARE_COIN_REWARD = 10;
export const SHARE_ENERGY_REWARD = 10;

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export interface DailyShareState {
  date: string;
  count: number;
}

export function getDailyShareState(): DailyShareState {
  try {
    const raw = localStorage.getItem(SHARE_STORAGE_KEY);
    if (!raw) {
      return { date: getTodayString(), count: 0 };
    }
    const parsed = JSON.parse(raw) as DailyShareState;
    if (parsed.date !== getTodayString()) {
      return { date: getTodayString(), count: 0 };
    }
    return parsed;
  } catch {
    return { date: getTodayString(), count: 0 };
  }
}

export function getRemainingDailyShares(): number {
  const state = getDailyShareState();
  return Math.max(0, MAX_DAILY_SHARES - state.count);
}

export function recordShareClaim(): boolean {
  const state = getDailyShareState();
  if (state.count >= MAX_DAILY_SHARES) {
    return false;
  }
  const nextState: DailyShareState = {
    date: getTodayString(),
    count: state.count + 1,
  };
  localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(nextState));
  return true;
}

export function shareTrophyFish(fish: ActiveFishState, mode: 'story' | 'message'): void {
  const isLegendary = fish.sizeCategory === 'legendary';
  const header = isLegendary ? '👑 Я поймал(а) ЛЕГЕНДУ' : '🏆 Мой новый ТРОФЕЙ';
  const text = `${header} в игре «Русская Рыбалка»! 🐟 ${fish.fish.name} весом ${formatWeight(fish.weight)}! Попробуй побить мой рекорд! 🎣`;

  // Формируем ссылку на бота или текущее приложение
  const gameUrl = window.location.href.split('?')[0];

  const tg = window.Telegram?.WebApp;

  if (mode === 'story' && tg?.shareToStory) {
    try {
      const mediaUrl = fish.fish.image
        ? (fish.fish.image.startsWith('http') ? fish.fish.image : `${window.location.origin}${fish.fish.image}`)
        : `${window.location.origin}/assets/icons/app_icon.png`;

      tg.shareToStory(mediaUrl, {
        text,
        widget_link: {
          url: gameUrl,
          name: 'Играть в Русскую Рыбалку',
        },
      });
      return;
    } catch (err) {
      console.warn('Failed to share to story, falling back to message link', err);
    }
  }

  // Fallback или режим 'message': отправка через стандартный диалог шеринга Telegram
  const shareLink = `https://t.me/share/url?url=${encodeURIComponent(gameUrl)}&text=${encodeURIComponent(text)}`;

  if (tg?.openTelegramLink) {
    tg.openTelegramLink(shareLink);
  } else {
    window.open(shareLink, '_blank');
  }
}
