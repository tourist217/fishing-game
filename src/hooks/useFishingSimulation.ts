import { useState, useEffect, useRef } from 'react';
import { getRandomFish } from '../fishData';
import type { GameState } from '../components/FishingScreen';
import type { CaughtFishItem } from '../components/InventoryScreen';
import type { FishingLocation } from '../locationsData';

interface ActiveFishState extends CaughtFishItem {
  rodBrokenRisk?: boolean;
}

interface UseFishingSimulationProps {
  currentRodStrength: number;
  currentLineTensileKg: number;
  reelPullSpeed: number;
  hookSharpenLevel: number;
  reelOilLevel: number;
  selectedBaitId: string;
  baits: Record<string, number>;
  currentLocation: FishingLocation;
  consumeBait: (baitId: string) => boolean;
  onFishCaught: (fish: CaughtFishItem, exp: number) => void;
  triggerHaptic?: (type: 'impact' | 'notification' | 'selection') => void;
}

export function useFishingSimulation({
  currentRodStrength,
  currentLineTensileKg,
  reelPullSpeed,
  hookSharpenLevel,
  reelOilLevel,
  selectedBaitId,
  baits,
  currentLocation,
  consumeBait,
  onFishCaught,
  triggerHaptic,
}: UseFishingSimulationProps) {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentFish, setCurrentFish] = useState<ActiveFishState | null>(null);
  const [canDismissModal, setCanDismissModal] = useState<boolean>(false);

  const [tension, setTension] = useState<number>(50);
  const [catchProgress, setCatchProgress] = useState<number>(15);

  const isPullingRef = useRef<boolean>(false);
  const tensionRef = useRef<number>(50);
  const progressRef = useRef<number>(15);

  // Рефы для стабильной работы интервала без ре-триггеров
  const onFishCaughtRef = useRef(onFishCaught);
  useEffect(() => {
    onFishCaughtRef.current = onFishCaught;
  }, [onFishCaught]);

  const triggerHapticRef = useRef(triggerHaptic);
  useEffect(() => {
    triggerHapticRef.current = triggerHaptic;
  }, [triggerHaptic]);

  const currentFishRef = useRef(currentFish);
  useEffect(() => {
    currentFishRef.current = currentFish;
  }, [currentFish]);

  const rodStrengthRef = useRef(currentRodStrength);
  useEffect(() => {
    rodStrengthRef.current = currentRodStrength;
  }, [currentRodStrength]);

  const lineTensileRef = useRef(currentLineTensileKg);
  useEffect(() => {
    lineTensileRef.current = currentLineTensileKg;
  }, [currentLineTensileKg]);

  const hookSharpenRef = useRef(hookSharpenLevel);
  useEffect(() => {
    hookSharpenRef.current = hookSharpenLevel;
  }, [hookSharpenLevel]);

  const reelSpeedRef = useRef(reelPullSpeed * (1 + reelOilLevel * 0.12));
  useEffect(() => {
    reelSpeedRef.current = reelPullSpeed * (1 + reelOilLevel * 0.12);
  }, [reelPullSpeed, reelOilLevel]);

  // Динамический центр зелёной зоны
  const [sweetZoneCenter, setSweetZoneCenter] = useState<number>(50);
  const sweetZoneCenterRef = useRef<number>(50);

  // Расчёт комфортной ширины зоны
  const calculateZoneWidth = () => {
    const fish = currentFishRef.current;
    // Базовая комфортная ширина
    let width = 42 + hookSharpenRef.current * 4;

    if (fish) {
      const effectiveLimit = Math.min(rodStrengthRef.current || 0.25, lineTensileRef.current || 0.4);
      const ratio = fish.weight / effectiveLimit;

      // Сужаем зону в 1.8 раза только если рыба весит более 65% от теста снасти
      if (ratio >= 0.65) {
        width = Math.round(width / 1.8);
      }
    }
    return Math.max(20, Math.min(60, width));
  };

  const zoneWidth = calculateZoneWidth();
  const sweetSpotStart = Math.max(5, sweetZoneCenter - zoneWidth / 2);
  const sweetSpotEnd = Math.min(95, sweetZoneCenter + zoneWidth / 2);

  useEffect(() => {
    sweetZoneCenterRef.current = sweetZoneCenter;
  }, [sweetZoneCenter]);

  // Заброс удочки
  const startFishing = () => {
    const availableBait = baits[selectedBaitId] || 0;
    if (availableBait <= 0) return;
    if (!consumeBait(selectedBaitId)) return;

    isPullingRef.current = false;
    setSweetZoneCenter(50);
    sweetZoneCenterRef.current = 50;
    setGameState('waiting');
    triggerHapticRef.current?.('selection');

    setTimeout(() => {
      const generated = getRandomFish(
        rodStrengthRef.current,
        lineTensileRef.current,
        selectedBaitId,
        currentLocation.weightModifier
      );

      setCurrentFish({
        ...generated,
        price: generated.price,
        uid: Math.random().toString(36).substring(2, 9),
        caughtAt: Date.now(),
      });
      setGameState('hooked');
      triggerHapticRef.current?.('notification');
    }, Math.random() * 2000 + 1500);
  };

  // Переход к вываживанию
  const startReeling = () => {
    isPullingRef.current = false;
    tensionRef.current = 50;
    progressRef.current = 15;
    setTension(50);
    setCatchProgress(15);
    setSweetZoneCenter(50);
    sweetZoneCenterRef.current = 50;
    setGameState('reeling');
    triggerHapticRef.current?.('impact');
  };

  // Блуждание зоны для тяжелой рыбы (весом от 85% теста снасти)
  useEffect(() => {
    if (gameState !== 'reeling' || !currentFish) return;

    const effectiveLimit = Math.min(rodStrengthRef.current, lineTensileRef.current);
    const weightRatio = currentFish.weight / effectiveLimit;

    if (weightRatio < 0.85) {
      setSweetZoneCenter(50);
      sweetZoneCenterRef.current = 50;
      return;
    }

    const moveInterval = setInterval(() => {
      const possiblePositions = [30, 42, 50, 58, 70];
      const nextPos = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
      setSweetZoneCenter(nextPos);
      sweetZoneCenterRef.current = nextPos;
      triggerHapticRef.current?.('selection');
    }, 2500);

    return () => clearInterval(moveInterval);
  }, [gameState, currentFish]);

  // ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ (ровно 1 запуск на сессию вываживания)
  useEffect(() => {
    if (gameState !== 'reeling') {
      isPullingRef.current = false;
      return;
    }

    tensionRef.current = 50;
    progressRef.current = 15;
    setTension(50);
    setCatchProgress(15);

    const interval = setInterval(() => {
      // 1. Физика тяги
      if (isPullingRef.current) {
        tensionRef.current += 1.9;
      } else {
        tensionRef.current -= 2.1;
      }

      // 2. Проверка попадания в зону
      const fish = currentFishRef.current;
      const effectiveLimit = Math.min(rodStrengthRef.current || 0.25, lineTensileRef.current || 0.4);
      const ratio = fish ? fish.weight / effectiveLimit : 0;
      
      let width = 42 + hookSharpenRef.current * 4;
      if (ratio >= 0.65) {
        width = Math.round(width / 1.8);
      }
      width = Math.max(20, Math.min(60, width));

      const curStart = Math.max(5, sweetZoneCenterRef.current - width / 2);
      const curEnd = Math.min(95, sweetZoneCenterRef.current + width / 2);

      const inZone = tensionRef.current >= curStart && tensionRef.current <= curEnd;
      progressRef.current += inZone ? 1.0 * reelSpeedRef.current : -0.35;

      // 3. Проигрыш
      if (tensionRef.current >= 100 || tensionRef.current <= 0 || progressRef.current <= 0) {
        clearInterval(interval);
        isPullingRef.current = false;
        setGameState('lost');
        setCanDismissModal(false);
        setTimeout(() => setCanDismissModal(true), 1200);
        (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
        return;
      }

      // 4. Победа
      if (progressRef.current >= 100) {
        clearInterval(interval);
        isPullingRef.current = false;
        const caught = currentFishRef.current;
        if (caught) {
          const { rodBrokenRisk: _risk, ...cleanFish } = caught;
          onFishCaughtRef.current(cleanFish, caught.exp);
        }
        setGameState('caught');
        setCanDismissModal(false);
        setTimeout(() => setCanDismissModal(true), 1500);
        triggerHapticRef.current?.('notification');
        return;
      }

      // 5. Отрисовка
      setTension(Math.max(0, Math.min(100, tensionRef.current)));
      setCatchProgress(Math.max(0, Math.min(100, progressRef.current)));
    }, 40);

    return () => {
      clearInterval(interval);
      isPullingRef.current = false;
    };
  }, [gameState]);

  const handlePullStart = () => {
    isPullingRef.current = true;
  };

  const handlePullEnd = () => {
    isPullingRef.current = false;
  };

  const dismissModal = () => {
    if (canDismissModal) {
      setGameState('idle');
    }
  };

  const resetToIdle = () => {
    isPullingRef.current = false;
    setGameState('idle');
  };

  return {
    gameState,
    tension,
    catchProgress,
    sweetSpotStart,
    sweetSpotEnd,
    currentFish,
    canDismissModal,
    startFishing,
    startReeling,
    handlePullStart,
    handlePullEnd,
    dismissModal,
    resetToIdle,
  };
}