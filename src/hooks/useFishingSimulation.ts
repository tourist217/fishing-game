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

  // Динамический центр зелёной зоны
  const [sweetZoneCenter, setSweetZoneCenter] = useState<number>(50);
  const sweetZoneCenterRef = useRef<number>(50);

  // Расчёт ширины безопасной зоны
  const calculateZoneWidth = () => {
    if (!currentFish) return 36;
    const effectiveLimit = Math.min(currentRodStrength, currentLineTensileKg);
    const weightRatio = currentFish.weight / effectiveLimit;

    let width = 36 + hookSharpenLevel * 3;
    if (weightRatio >= 0.4) {
      width = width / 2;
    }
    return Math.max(14, Math.round(width));
  };

  const zoneWidth = calculateZoneWidth();
  const sweetSpotStart = Math.max(5, sweetZoneCenter - zoneWidth / 2);
  const sweetSpotEnd = Math.min(95, sweetZoneCenter + zoneWidth / 2);

  // Синхронизируем рефы для чистого доступа внутри игрового цикла
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
    triggerHaptic?.('selection');

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
      triggerHaptic?.('notification');
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
    triggerHaptic?.('impact');
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
      triggerHaptic?.('selection');
    }, 2400);

    return () => clearInterval(moveInterval);
  }, [gameState, currentFish, currentRodStrength, currentLineTensileKg, triggerHaptic]);

  // ГЛАВНЫЙ ФИЗИЧЕСКИЙ ЦИКЛ ВЫВАЖИВАНИЯ
  useEffect(() => {
    if (gameState !== 'reeling') {
      isPullingRef.current = false;
      return;
    }

    tensionRef.current = 50;
    progressRef.current = 15;
    setTension(50);
    setCatchProgress(15);

    const speedMultiplier = reelPullSpeed * (1 + reelOilLevel * 0.12);

    const interval = setInterval(() => {
      // 1. Физика натяжения
      if (isPullingRef.current) {
        tensionRef.current += 2.0;
      } else {
        tensionRef.current -= 2.2;
      }

      // 2. Расчёт попадания в зелёную зону
      const currentWidth = calculateZoneWidth();
      const currentStart = Math.max(5, sweetZoneCenterRef.current - currentWidth / 2);
      const currentEnd = Math.min(95, sweetZoneCenterRef.current + currentWidth / 2);

      const inZone = tensionRef.current >= currentStart && tensionRef.current <= currentEnd;
      progressRef.current += inZone ? 1.0 * speedMultiplier : -0.4;

      // 3. Проверка поражения
      if (tensionRef.current >= 100 || tensionRef.current <= 0 || progressRef.current <= 0) {
        clearInterval(interval);
        isPullingRef.current = false;
        setGameState('lost');
        setCanDismissModal(false);
        setTimeout(() => setCanDismissModal(true), 1200);
        (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
        return;
      }

      // 4. Проверка победы (рыба поймана)
      if (progressRef.current >= 100) {
        clearInterval(interval);
        isPullingRef.current = false;
        if (currentFish) {
          const { rodBrokenRisk: _risk, ...cleanFish } = currentFish;
          onFishCaught(cleanFish, currentFish.exp);
        }
        setGameState('caught');
        setCanDismissModal(false);
        setTimeout(() => setCanDismissModal(true), 1500);
        triggerHaptic?.('notification');
        return;
      }

      // 5. ГАРАНТИРОВАННО ОБНОВЛЯЕМ РЕАКТ-СОСТОЯНИЕ ДЛЯ АНИМАЦИИ
      const clampedTension = Math.max(0, Math.min(100, tensionRef.current));
      const clampedProgress = Math.max(0, Math.min(100, progressRef.current));

      setTension(clampedTension);
      setCatchProgress(clampedProgress);
    }, 40);

    return () => {
      clearInterval(interval);
      isPullingRef.current = false;
    };
  }, [gameState, currentFish, reelPullSpeed, reelOilLevel, onFishCaught, triggerHaptic]);

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