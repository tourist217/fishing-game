import { useState, useCallback } from 'react';
import { trackGoal } from '../utils/analytics';

export type TutorialStep =
  | 'welcome_cast'   // Шаг 1: На главном экране -> Нажми «На рыбалку»
  | 'cast_rod'       // Шаг 2: На водоёме -> Забрось удочку
  | 'reeling_guide'  // Шаг 3: При вываживании -> Удерживай «Тянуть»
  | 'open_keepnet'   // Шаг 4: Рыба поймана -> Загляни в Садок
  | 'sell_fish'      // Шаг 5: В садке -> Продай рыбу за монеты
  | 'completed';     // Обучение пройдено

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
          case 'sell_fish': next = 'completed'; break;
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
