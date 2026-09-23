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
  const [catchProgress, setCatchProgress] = useState<number>(0);
  const isPullingRef = useRef<boolean>(false);

  // Динамический центр зелёной зоны
  const [sweetZoneCenter, setSweetZoneCenter] = useState<number>(50);

  // Расчёт ширины зелёной зоны по соотношению веса рыбы к тесту снасти
  const calculateZoneWidth = () => {
    if (!currentFish) return 36;
    const effectiveLimit = Math.min(currentRodStrength, currentLineTensileKg);
    const weightRatio = currentFish.weight / effectiveLimit;

    // Базовая ширина с бонусом заточки крючков
    let width = 36 + hookSharpenLevel * 3;

    if (weightRatio >= 0.4) {
      // От 40% веса зона сужается в 2 раза
      width = width / 2;
    }
    return Math.max(14, Math.round(width));
  };

  const zoneWidth = calculateZoneWidth();
  const sweetSpotStart = Math.max(5, sweetZoneCenter - zoneWidth / 2);
  const sweetSpotEnd = Math.min(95, sweetZoneCenter + zoneWidth / 2);

  // Старт заброса удочки
  const startFishing = () => {
    const availableBait = baits[selectedBaitId] || 0;
    if (availableBait <= 0) return;

    if (!consumeBait(selectedBaitId)) return;

    isPullingRef.current = false;
    setSweetZoneCenter(50);
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

  // Переход к фазе вываживания
  const startReeling = () => {
    isPullingRef.current = false;
    setTension(50);
    setCatchProgress(15);
    setSweetZoneCenter(50);
    setGameState('reeling');
    triggerHaptic?.('impact');
  };

  // Таймер случайного смещения зоны при вываживании крупной рыбы (от 80% теста снасти)
  useEffect(() => {
    if (gameState !== 'reeling' || !currentFish) return;

    const effectiveLimit = Math.min(currentRodStrength, currentLineTensileKg);
    const weightRatio = currentFish.weight / effectiveLimit;

    if (weightRatio < 0.8) {
      setSweetZoneCenter(50);
      return;
    }

    const moveInterval = setInterval(() => {
      const possiblePositions = [25, 38, 50, 62, 75];
      const nextPos = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
      setSweetZoneCenter(nextPos);
      triggerHaptic?.('selection');
    }, 2400);

    return () => clearInterval(moveInterval);
  }, [gameState, currentFish, currentRodStrength, currentLineTensileKg, triggerHaptic]);

  // Физический тик вываживания (интервал 40 мс)
  useEffect(() => {
    if (gameState !== 'reeling') {
      isPullingRef.current = false;
      return;
    }

    let localTension = 50;
    let localProgress = 15;
    setTension(50);
    setCatchProgress(15);

    const speedMultiplier = reelPullSpeed * (1 + reelOilLevel * 0.12);

    const interval = setInterval(() => {
      // Кнопка зажата -> рост натяжения, отпущена -> гарантированное падение
      if (isPullingRef.current) {
        localTension += 2.0;
      } else {
        localTension -= 2.2;
      }

      const inSweetSpot = localTension >= sweetSpotStart && localTension <= sweetSpotEnd;
      localProgress += inSweetSpot ? 1.0 * speedMultiplier : -0.4;

      if (localTension >= 100 || localTension <= 0 || localProgress <= 0) {
        clearInterval(interval);
        isPullingRef.current = false;
        setGameState('lost');
        setCanDismissModal(false);
        setTimeout(() => setCanDismissModal(true), 1200);
        (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
        return;
      }

      if (localProgress >= 100) {
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

      setTension(Math.max(0, Math.min(100, localTension)));
      setCatchProgress(Math.max(0, Math.min(100, localProgress)));
    }, 40);

    return () => {
      clearInterval(interval);
      isPullingRef.current = false;
    };
  }, [
    gameState,
    currentFish,
    sweetSpotStart,
    sweetSpotEnd,
    reelPullSpeed,
    reelOilLevel,
    onFishCaught,
    triggerHaptic,
  ]);

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