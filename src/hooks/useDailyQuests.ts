import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  type DailyQuestsState,
  getTodayDateString,
  generateDailyQuests,
  DAILY_BONUS_REWARD,
} from '../types/quests';
import type { CaughtFishItem } from '../components/InventoryScreen';
import { triggerHaptic } from '../utils/haptics';

interface UseDailyQuestsProps {
  onAddCoins: (amount: number) => void;
  onAddExp: (amount: number) => void;
  onAddGems: (amount: number) => void;
}

const STORAGE_KEY = 'fg_daily_quests';

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function useDailyQuests({ onAddCoins, onAddExp, onAddGems }: UseDailyQuestsProps) {
  const today = getTodayDateString();

  const [state, setState] = useState<DailyQuestsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: DailyQuestsState = JSON.parse(saved);
        if (parsed && parsed.date === today && Array.isArray(parsed.quests) && parsed.quests.length === 3) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    // Новый день или первый запуск
    const newQuests = generateDailyQuests(today);
    const initial: DailyQuestsState = {
      date: today,
      quests: newQuests,
      allCompletedBonusClaimed: false,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch {
      // ignore
    }
    return initial;
  });

  const [timeUntilMidnight, setTimeUntilMidnight] = useState<string>(getTimeUntilMidnight);

  // Таймер обратного отсчета до полуночи
  useEffect(() => {
    const interval = setInterval(() => {
      const nowStr = getTimeUntilMidnight();
      setTimeUntilMidnight(nowStr);

      // Проверяем, не наступил ли новый день
      const currentToday = getTodayDateString();
      if (currentToday !== state.date) {
        const freshQuests = generateDailyQuests(currentToday);
        const nextState: DailyQuestsState = {
          date: currentToday,
          quests: freshQuests,
          allCompletedBonusClaimed: false,
        };
        setState(nextState);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        } catch {
          // ignore
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.date]);

  // Сохранение в localStorage при изменении
  const saveState = useCallback((newState: DailyQuestsState) => {
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // ignore
    }
  }, []);

  // Проверка прогресса при поимке рыбы
  const handleFishCaught = useCallback(
    (caughtItem: CaughtFishItem, usedBaitId: string) => {
      let changed = false;
      let anyJustCompleted = false;

      const nextQuests = state.quests.map((q) => {
        if (q.isCompleted) return q;

        let shouldIncrement = false;

        switch (q.objectiveType) {
          case 'catch_any':
            shouldIncrement = true;
            break;

          case 'catch_species':
            if (q.targetFishId && caughtItem.fish.id === q.targetFishId) {
              shouldIncrement = true;
            }
            break;

          case 'catch_min_weight':
            if (q.targetMinWeight && caughtItem.weight >= q.targetMinWeight) {
              shouldIncrement = true;
            }
            break;

          case 'catch_with_bait':
            if (q.targetBaitId && usedBaitId === q.targetBaitId) {
              shouldIncrement = true;
            }
            break;

          case 'catch_size_category':
            if (q.targetSizeCategory === 'trophy') {
              if (caughtItem.sizeCategory === 'trophy') shouldIncrement = true;
            } else if (q.targetSizeCategory === 'large') {
              if (caughtItem.sizeCategory === 'large' || caughtItem.sizeCategory === 'trophy') {
                shouldIncrement = true;
              }
            } else if (caughtItem.sizeCategory === q.targetSizeCategory) {
              shouldIncrement = true;
            }
            break;

          case 'catch_rarity':
            if (q.targetRarity === 'epic') {
              if (caughtItem.fish.rarity === 'epic' || caughtItem.fish.rarity === 'legendary') {
                shouldIncrement = true;
              }
            } else if (caughtItem.fish.rarity === q.targetRarity) {
              shouldIncrement = true;
            }
            break;
        }

        if (shouldIncrement) {
          const nextCount = q.currentCount + 1;
          const isCompleted = nextCount >= q.targetCount;
          changed = true;
          if (isCompleted && !q.isCompleted) {
            anyJustCompleted = true;
          }
          return {
            ...q,
            currentCount: Math.min(q.targetCount, nextCount),
            isCompleted,
          };
        }

        return q;
      });

      if (changed) {
        if (anyJustCompleted) {
          triggerHaptic('notification');
        }
        saveState({
          ...state,
          quests: nextQuests,
        });
      }
    },
    [state, saveState]
  );

  // Забрать награду за отдельный квест
  const claimQuestReward = useCallback(
    (questId: string): boolean => {
      const quest = state.quests.find((q) => q.id === questId);
      if (!quest || !quest.isCompleted || quest.isClaimed) return false;

      onAddCoins(quest.rewardCoins);
      onAddExp(quest.rewardExp);
      if (quest.rewardGems && quest.rewardGems > 0) {
        onAddGems(quest.rewardGems);
      }

      triggerHaptic('notification');

      const nextQuests = state.quests.map((q) => (q.id === questId ? { ...q, isClaimed: true } : q));
      saveState({
        ...state,
        quests: nextQuests,
      });

      return true;
    },
    [state, onAddCoins, onAddExp, onAddGems, saveState]
  );

  // Забрать супер-награду дня за 3 выполненных квеста
  const claimDailyBonus = useCallback((): boolean => {
    const allCompleted = state.quests.every((q) => q.isCompleted);
    if (!allCompleted || state.allCompletedBonusClaimed) return false;

    onAddCoins(DAILY_BONUS_REWARD.coins);
    onAddExp(DAILY_BONUS_REWARD.exp);
    onAddGems(DAILY_BONUS_REWARD.gems);

    triggerHaptic('notification');

    saveState({
      ...state,
      allCompletedBonusClaimed: true,
    });

    return true;
  }, [state, onAddCoins, onAddExp, onAddGems, saveState]);

  // Вычисляемые свойства
  const completedCount = useMemo(() => state.quests.filter((q) => q.isCompleted).length, [state.quests]);

  const unclaimedCount = useMemo(
    () => state.quests.filter((q) => q.isCompleted && !q.isClaimed).length,
    [state.quests]
  );

  const isAllCompleted = completedCount === 3;
  const canClaimBonus = isAllCompleted && !state.allCompletedBonusClaimed;

  return {
    quests: state.quests,
    allCompletedBonusClaimed: state.allCompletedBonusClaimed,
    timeUntilMidnight,
    completedCount,
    unclaimedCount,
    isAllCompleted,
    canClaimBonus,
    handleFishCaught,
    claimQuestReward,
    claimDailyBonus,
  };
}
