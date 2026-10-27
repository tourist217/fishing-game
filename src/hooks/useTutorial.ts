import { useState, useCallback } from 'react';
import { trackGoal } from '../utils/analytics';

export type TutorialStep =
  | 'welcome_cast'   // Шаг 1: Главный экран -> Нажми «На рыбалку»
  | 'cast_rod'       // Шаг 2: Водоём -> Забрось удочку
  | 'reeling_guide'  // Шаг 3: Вываживание -> Удерживай «Тянуть»
  | 'open_keepnet'   // Шаг 4: Поймал рыбу -> Открой Садок
  | 'sell_fish'      // Шаг 5: Садок -> Продай рыбу (+10 монет бонус!)
  | 'go_to_shop'     // Шаг 6: Навигация -> В Магазин
  | 'buy_bait'       // Шаг 7: Магазин -> Покупка наживки (червей)
  | 'energy_info'    // Шаг 8: Энергия -> Расход и восстановление
  | 'map_info'       // Шаг 9: Карта -> Водоёмы и уровни
  | 'completed';     // Обучение завершено

const STORAGE_KEY = 'fg_tutorial_v1_status';

export function useTutorial(playerLevel: number, playerExp: number) {
  const [step, setStep] = useState<TutorialStep>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'completed') return 'completed';
      // Если игрок уже прокачан (не новичок), не навязываем
      if (playerLevel > 1 || playerExp > 10) {
        return 'completed';
      }
      return 'welcome_cast';
    } catch {
      return 'completed';
    }
  });

  const completeTutorial = useCallback(() => {
    setStep('completed');
    try {
      localStorage.setItem(STORAGE_KEY, 'completed');
      trackGoal('tutorial_completed');
    } catch {}
  }, []);

  const skipTutorial = useCallback(() => {
    setStep('completed');
    try {
      localStorage.setItem(STORAGE_KEY, 'completed');
      trackGoal('tutorial_skipped');
    } catch {}
  }, []);

  const resetTutorial = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setStep('welcome_cast');
    trackGoal('tutorial_restarted');
  }, []);

  const nextStep = useCallback((expectedCurrent?: TutorialStep, targetStep?: TutorialStep) => {
    setStep((prev) => {
      if (prev === 'completed') return 'completed';
      if (expectedCurrent && prev !== expectedCurrent) return prev;

      let next: TutorialStep = 'completed';
      if (targetStep) {
        next = targetStep;
      } else {
        switch (prev) {
          case 'welcome_cast': next = 'cast_rod'; break;
          case 'cast_rod': next = 'reeling_guide'; break;
          case 'reeling_guide': next = 'open_keepnet'; break;
          case 'open_keepnet': next = 'sell_fish'; break;
          case 'sell_fish': next = 'go_to_shop'; break;
          case 'go_to_shop': next = 'buy_bait'; break;
          case 'buy_bait': next = 'energy_info'; break;
          case 'energy_info': next = 'map_info'; break;
          case 'map_info': next = 'completed'; break;
          default: next = 'completed';
        }
      }

      if (next === 'completed') {
        try {
          localStorage.setItem(STORAGE_KEY, 'completed');
          trackGoal('tutorial_completed');
        } catch {}
      } else {
        trackGoal(`tutorial_step_${next}`);
      }
      return next;
    });
  }, []);

  return {
    step,
    isCompleted: step === 'completed',
    nextStep,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  };
}
