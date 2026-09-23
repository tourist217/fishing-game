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

  // Рефы для стабильных колбэков и параметров внутри таймера без перезапуска эффекта
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

  const reelSpeedRef = useRef(reelPullSpeed * (1 + reelOilLevel * 0.12));
  useEffect(() => {
    reelSpeedRef.current = reelPullSpeed * (1 + reelOilLevel * 0.12);
  }, [reelPullSpeed, reelOilLevel]);

  // Динамический центр зелёной зоны
  const [sweetZoneCenter, setSweetZoneCenter] = useState<number>(50);
  const sweetZoneCenterRef = useRef<number>(50);

  // Расчёт ширины безопасной зоны
  const calculateZoneWidth = () => {
    const fish = currentFishRef.current;
    if (!fish) return 36;
    const effectiveLimit = Math.min(currentRodStrength, currentLineTensileKg);
    const weightRatio = fish.weight / effectiveLimit;

    let width = 36 + hookSharpenLevel * 3;
    if (weightRatio >= 0.4) {
      width = width / 2;
    }
    return Math.max(14, Math.round(width));
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
        currentRodStrength,
        currentLineTensileKg,
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

  // Перемещение зоны для крупной рыбы
  useEffect(() => {
    if (gameState !== 'reeling' || !currentFish) return;

    const effectiveLimit = Math.min(currentRodStrength, currentLineTensileKg);
    const weightRatio = currentFish.weight / effectiveLimit;

    if (weightRatio < 0.8) {
      setSweetZoneCenter(50);
      sweetZoneCenterRef.current = 50;
      return;
    }

    const moveInterval = setInterval(() => {
      const possiblePositions = [25, 38, 50, 62, 75];
      const nextPos = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
      setSweetZoneCenter(nextPos);
      sweetZoneCenterRef.current = nextPos;
      triggerHapticRef.current?.('selection');
    }, 2400);

    return () => clearInterval(moveInterval);
  }, [gameState, currentFish, currentRodStrength, currentLineTensileKg]);

  // ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ (Запускается СТРОГО 1 раз при переходе в reeling)
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
      // 1. Физика натяжения
      if (isPullingRef.current) {
        tensionRef.current += 2.0;
      } else {
        tensionRef.current -= 2.2;
      }

      // 2. Расчёт зоны
      const fish = currentFishRef.current;
      const effectiveLimit = Math.min(currentRodStrength, currentLineTensileKg);
      const weightRatio = fish ? fish.weight / effectiveLimit : 0;
      let currentWidth = 36 + hookSharpenLevel * 3;
      if (weightRatio >= 0.4) {
        currentWidth = currentWidth / 2;
      }
      currentWidth = Math.max(14, Math.round(currentWidth));

      const currentStart = Math.max(5, sweetZoneCenterRef.current - currentWidth / 2);
      const currentEnd = Math.min(95, sweetZoneCenterRef.current + currentWidth / 2);

      const inZone = tensionRef.current >= currentStart && tensionRef.current <= currentEnd;
      progressRef.current += inZone ? 1.0 * reelSpeedRef.current : -0.4;

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

      // 5. Обновление UI
      setTension(Math.max(0, Math.min(100, tensionRef.current)));
      setCatchProgress(Math.max(0, Math.min(100, progressRef.current)));
    }, 40);

    return () => {
      clearInterval(interval);
      isPullingRef.current = false;
    };
  }, [gameState, currentRodStrength, currentLineTensileKg, hookSharpenLevel]);

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