import { useState, useEffect, useRef, useMemo } from 'react';
import { getRandomFish, type FishSizeCategory } from '../fishData';
import type { GameState } from '../components/FishingScreen';
import type { CaughtFishItem } from '../components/InventoryScreen';
import type { FishingLocation } from '../locationsData';
import { getFishDifficultyConfig } from '../utils/fishUtils';


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
  onLineBreak?: () => void;
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
  onLineBreak,
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

  const onLineBreakRef = useRef(onLineBreak);
  useEffect(() => {
    onLineBreakRef.current = onLineBreak;
  }, [onLineBreak]);

  // Рефы для изоляции замыканий от жизненного цикла React
  const consumeBaitRef = useRef(consumeBait);
  useEffect(() => {
    consumeBaitRef.current = consumeBait;
  }, [consumeBait]);

  const baitsRef = useRef(baits);
  useEffect(() => {
    baitsRef.current = baits;
  }, [baits]);

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

  const currentLocationRef = useRef(currentLocation);
  useEffect(() => {
    currentLocationRef.current = currentLocation;
  }, [currentLocation]);

  const selectedBaitIdRef = useRef(selectedBaitId);
  useEffect(() => {
    selectedBaitIdRef.current = selectedBaitId;
  }, [selectedBaitId]);

  // Динамический центр безопасной зоны
  const [sweetZoneCenter, setSweetZoneCenter] = useState<number>(50);
  const sweetZoneCenterRef = useRef<number>(50);

  // Расчёт ширины безопасной зоны на основе веса рыбы и прочности снастей
  const zoneWidth = useMemo(() => {
    if (currentFish) {
      return getFishDifficultyConfig(
        currentFish.weight,
        currentRodStrength,
        currentLineTensileKg,
        hookSharpenLevel
      ).zoneWidth;
    }
    return 45;
  }, [currentFish, hookSharpenLevel, currentRodStrength, currentLineTensileKg]);

  const sweetSpotStart = Math.max(5, sweetZoneCenter - zoneWidth / 2);
  const sweetSpotEnd = Math.min(95, sweetZoneCenter + zoneWidth / 2);

  useEffect(() => {
    sweetZoneCenterRef.current = sweetZoneCenter;
  }, [sweetZoneCenter]);

  // Запуск процесса ловли
  const startFishing = () => {
    if (lineTensileRef.current <= 0) {
      triggerHapticRef.current?.('notification');
      return;
    }

    const currentBaitId = selectedBaitIdRef.current;
    const availableBait = baitsRef.current[currentBaitId] || 0;

    if (availableBait <= 0) {
      return;
    }

    const consumed = consumeBaitRef.current(currentBaitId);
    if (!consumed) {
      return;
    }

    isPullingRef.current = false;
    setSweetZoneCenter(50);
    sweetZoneCenterRef.current = 50;
    setGameState('waiting');
    triggerHapticRef.current?.('selection');

    const waitTime = Math.random() * 2000 + 1500;
    setTimeout(() => {
      const generated = getRandomFish(
        rodStrengthRef.current,
        lineTensileRef.current,
        currentBaitId,
        currentLocationRef.current.id,
        currentLocationRef.current.weightModifier
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
    }, waitTime);
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

  // Анимация рывков рыбы (динамическое смещение зеленой зоны по весу рыбы и нагрузке на снасть)
  useEffect(() => {
    if (gameState !== 'reeling' || !currentFish) return;

    const config = getFishDifficultyConfig(
      currentFish.weight,
      rodStrengthRef.current,
      lineTensileRef.current,
      hookSharpenRef.current
    );

    if (config.jerkIntervalMs <= 0) {
      setSweetZoneCenter(50);
      sweetZoneCenterRef.current = 50;
      return;
    }

    const moveInterval = setInterval(() => {
      const possiblePositions = [25, 35, 45, 55, 65, 75];
      const nextPos = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
      setSweetZoneCenter(nextPos);
      sweetZoneCenterRef.current = nextPos;
      triggerHapticRef.current?.('selection');
    }, config.jerkIntervalMs);

    return () => clearInterval(moveInterval);
  }, [gameState, currentFish]);

  // Физический тик вываживания (40 мс)
  useEffect(() => {
    if (gameState !== 'reeling') {
      isPullingRef.current = false;
      return;
    }

    tensionRef.current = 50;
    progressRef.current = 15;

    const interval = setInterval(() => {
      const active = currentFishRef.current;
      const pullForce = active?.fish.fightBehavior?.pullForce || 1.0;
      const lineLimit = lineTensileRef.current;
      const isLineOverloaded = Boolean(active && lineLimit > 0 && active.weight > lineLimit);

      if (isPullingRef.current) {
        let pullSpeed = 1.9;
        if (isLineOverloaded && lineLimit > 0 && active) {
          const overload = active.weight / lineLimit;
          pullSpeed += Math.min(22, (overload - 1) * 10.0);
        }
        tensionRef.current += pullSpeed;
      } else {
        tensionRef.current -= 1.8 * pullForce;
      }

      const diffConfig = active
        ? getFishDifficultyConfig(
            active.weight,
            rodStrengthRef.current,
            lineTensileRef.current,
            hookSharpenRef.current
          )
        : { zoneWidth: 45, jerkIntervalMs: 0, loadRatio: 0.5 };

      const width = diffConfig.zoneWidth;

      const curStart = Math.max(5, sweetZoneCenterRef.current - width / 2);
      const curEnd = Math.min(95, sweetZoneCenterRef.current + width / 2);

      // Замедление смотки лески в зависимости от категории размера рыбы
      let sizeSpeedModifier = 1.0;
      if (active?.sizeCategory === 'medium') {
        sizeSpeedModifier = 0.83; // +20% дольше
      } else if (active?.sizeCategory === 'large') {
        sizeSpeedModifier = 0.71; // +40% дольше
      } else if (active?.sizeCategory === 'trophy') {
        sizeSpeedModifier = 0.625; // +60% дольше
      }

      const inZone = tensionRef.current >= curStart && tensionRef.current <= curEnd;
      progressRef.current += inZone ? 1.0 * reelSpeedRef.current * sizeSpeedModifier : -0.4;

      if (tensionRef.current >= 100 || tensionRef.current <= 0 || progressRef.current <= 0) {
        clearInterval(interval);
        isPullingRef.current = false;
        if (tensionRef.current >= 100 && isLineOverloaded) {
          onLineBreakRef.current?.();
          setGameState('line_broken');
        } else {
          setGameState('lost');
        }
        setCanDismissModal(false);
        setTimeout(() => setCanDismissModal(true), 1200);
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
        return;
      }

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