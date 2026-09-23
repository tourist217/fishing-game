import { useState, useEffect, useRef } from 'react';
import { getRandomFish, type FishSizeCategory } from '../fishData';
import type { GameState } from '../components/FishingScreen';
import type { CaughtFishItem } from '../components/InventoryScreen';
import type { FishingLocation } from '../locationsData';

export interface ActiveFishState extends CaughtFishItem {
  sizeCategory?: FishSizeCategory;
  categoryLabel?: string;
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

  // Стабильные ссылки
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

  // Динамический центр зоны
  const [sweetZoneCenter, setSweetZoneCenter] = useState<number>(50);
  const sweetZoneCenterRef = useRef<number>(50);

  // Расчёт ширины безопасной зоны
  const calculateZoneWidth = () => {
    const fish = currentFishRef.current;
    let width = 42 + hookSharpenRef.current * 4;

    if (fish) {
      const effectiveLimit = Math.min(rodStrengthRef.current || 0.25, lineTensileRef.current || 0.4);
      const ratio = fish.weight / effectiveLimit;

      // Сужение зоны в зависимости от соотношения веса рыбы к прочности снасти
      if (ratio >= 0.85) {
        width = Math.round(width / 2.0);
      } else if (ratio >= 0.65) {
        width = Math.round(width / 1.5);
      }
    }
    return Math.max(18, Math.min(65, width));
  };

  const zoneWidth = calculateZoneWidth();
  const sweetSpotStart = Math.max(5, sweetZoneCenter - zoneWidth / 2);
  const sweetSpotEnd = Math.min(95, sweetZoneCenter + zoneWidth / 2);

  useEffect(() => {
    sweetZoneCenterRef.current = sweetZoneCenter;
  }, [sweetZoneCenter]);

  // Заброс удилища
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
      // Генерируем рыбу с учетом текущего водоёма и насадки
      const generated = getRandomFish(
        rodStrengthRef.current,
        lineTensileRef.current,
        selectedBaitId,
        currentLocation.id,
        currentLocation.weightModifier
      );

      const readyFish: ActiveFishState = {
        fish: generated.fish,
        weight: generated.weight,
        price: generated.price,
        exp: generated.exp,
        sizeCategory: generated.sizeCategory,
        categoryLabel: generated.categoryLabel,
        uid: Math.random().toString(36).substring(2, 9),
        caughtAt: Date.now(),
        rodBrokenRisk: generated.rodBrokenRisk,
      };

      setCurrentFish(readyFish);
      currentFishRef.current = readyFish;
      setGameState('hooked');
      triggerHapticRef.current?.('notification');
    }, Math.random() * 2000 + 1500);
  };

  // Переход к процессу вываживания
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

  // Поведение безопасной зоны: рывки и блуждание под повадки рыбы
  useEffect(() => {
    if (gameState !== 'reeling' || !currentFish) return;

    const jerkFreq = currentFish.fish.fightBehavior?.jerkFrequency || 0.5;
    const effectiveLimit = Math.min(rodStrengthRef.current, lineTensileRef.current);
    const weightRatio = currentFish.weight / effectiveLimit;

    // Интервал смещения зоны зависит от частоты рывков рыбы
    const intervalMs = Math.max(1200, Math.round(3000 / jerkFreq));

    const moveInterval = setInterval(() => {
      // Спокойная мелкая рыба почти не смещает зону
      if (weightRatio < 0.6 && jerkFreq < 1.0) {
        setSweetZoneCenter(50);
        sweetZoneCenterRef.current = 50;
        return;
      }

      const possiblePositions = [28, 38, 50, 62, 72];
      const nextPos = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
      setSweetZoneCenter(nextPos);
      sweetZoneCenterRef.current = nextPos;
      triggerHapticRef.current?.('selection');
    }, intervalMs);

    return () => clearInterval(moveInterval);
  }, [gameState, currentFish]);

  // Главный физический цикл вываживания (40 мс)
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
      const active = currentFishRef.current;
      const pullForce = active?.fish.fightBehavior?.pullForce || 1.0;

      // 1. Физика натяжения с учётом силы рыбы
      if (isPullingRef.current) {
        tensionRef.current += 1.9;
      } else {
        // Рыба тянет леску вниз в зависимости от своей индивидуальной силы (pullForce)
        tensionRef.current -= 1.8 * pullForce;
      }

      // 2. Расчёт зоны и прогресса
      const effectiveLimit = Math.min(rodStrengthRef.current || 0.25, lineTensileRef.current || 0.4);
      const ratio = active ? active.weight / effectiveLimit : 0;

      let width = 42 + hookSharpenRef.current * 4;
      if (ratio >= 0.85) {
        width = Math.round(width / 2.0);
      } else if (ratio >= 0.65) {
        width = Math.round(width / 1.5);
      }
      width = Math.max(18, Math.min(65, width));

      const curStart = Math.max(5, sweetZoneCenterRef.current - width / 2);
      const curEnd = Math.min(95, sweetZoneCenterRef.current + width / 2);

      const inZone = tensionRef.current >= curStart && tensionRef.current <= curEnd;
      progressRef.current += inZone ? 1.0 * reelSpeedRef.current : -0.4;

      // 3. Сход или обрыв
      if (tensionRef.current >= 100 || tensionRef.current <= 0 || progressRef.current <= 0) {
        clearInterval(interval);
        isPullingRef.current = false;
        setGameState('lost');
        setCanDismissModal(false);
        setTimeout(() => setCanDismissModal(true), 1200);
        (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
        return;
      }

      // 4. Успешный вылов
      if (progressRef.current >= 100) {
        clearInterval(interval);
        isPullingRef.current = false;
        const caught = currentFishRef.current;
        if (caught) {
          const cleanFish: CaughtFishItem = {
            fish: caught.fish,
            weight: caught.weight,
            price: caught.price,
            exp: caught.exp,
            uid: caught.uid,
            caughtAt: caught.caughtAt,
          };
          onFishCaughtRef.current(cleanFish, caught.exp);
        }
        setGameState('caught');
        setCanDismissModal(false);
        setTimeout(() => setCanDismissModal(true), 1500);
        triggerHapticRef.current?.('notification');
        return;
      }

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