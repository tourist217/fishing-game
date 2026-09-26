import { useState, useEffect } from 'react';
import {
  ROD_TIERS,
  REEL_TIERS,
  LINE_TIERS,
  REED_FREE_LINE,
  INITIAL_PLAYER_GEAR,
  getRodStrength,
  getReelPullSpeed,
  getRodUpgradeCost,
  getReelUpgradeCost,
  type PlayerGearState,
  type RodTier,
  type ReelTier,
  type LineTier,
} from '../gearData';

export function useGearState(
  coins: number,
  playerLevel: number,
  spendCoins: (amount: number) => boolean,
  triggerHaptic?: (type: 'impact' | 'notification' | 'selection') => void
) {
  const [gear, setGear] = useState<PlayerGearState>(() => {
    try {
      const saved = localStorage.getItem('fg_gear');
      if (!saved) return INITIAL_PLAYER_GEAR;
      const parsed = JSON.parse(saved);
      const rodExists = ROD_TIERS.some((r) => r.id === parsed.equippedRodId);
      if (!rodExists) return INITIAL_PLAYER_GEAR;
      return parsed;
    } catch {
      return INITIAL_PLAYER_GEAR;
    }
  });

  // Синхронизация с localStorage
  useEffect(() => {
    localStorage.setItem('fg_gear', JSON.stringify(gear));
  }, [gear]);

  // Вычисляемые параметры активных снастей
  const currentRod: RodTier =
    ROD_TIERS.find((r) => r.id === gear.equippedRodId) || ROD_TIERS[0];
  const rodLevel = (gear.rodLevels && gear.rodLevels[currentRod.id]) || 1;
  const currentRodStrength = getRodStrength(currentRod, rodLevel) || 0.25;

  const currentReel: ReelTier | null = gear.equippedReelId
    ? REEL_TIERS.find((r) => r.id === gear.equippedReelId) || null
    : null;
  const reelLevel = (currentReel && gear.reelLevels && gear.reelLevels[currentReel.id]) || 1;
  const reelPullSpeed = currentReel ? getReelPullSpeed(currentReel, reelLevel) : 1.0;

  // Определение активности лески: если купленная леска экипирована и в наличии > 0 — используем её.
  // Если на камышовом удилище нет лески в запасе — бесплатно ставим камышовую леску 0.35 кг.
  // На остальных удочках без запаса лески — леска отсутствует (null).
  const currentLine: LineTier | null = (() => {
    if (gear.equippedLineId && (gear.lineStock?.[gear.equippedLineId] || 0) > 0) {
      return LINE_TIERS.find((l) => l.id === gear.equippedLineId) || null;
    }
    if (currentRod.id === 'rod_reed') {
      return REED_FREE_LINE;
    }
    return null;
  })();

  const currentLineTensileKg = currentLine
    ? currentLine.maxTensileKg
    : currentRod.id === 'rod_reed'
    ? 0.35
    : 0;

  const hasLineOnRod = Boolean(currentLine);

  // Действия: покупка, апгрейд, экипировка удилища
  const buyRod = (rod: RodTier) => {
    if (gear.ownedRods.includes(rod.id)) {
      setGear((prev) => ({
        ...prev,
        equippedRodId: rod.id,
        equippedReelId: rod.canMountReel ? prev.equippedReelId : null,
      }));
      triggerHaptic?.('selection');
      return true;
    }
    if (coins < rod.basePrice || playerLevel < rod.levelReq) return false;
    if (!spendCoins(rod.basePrice)) return false;

    setGear((prev) => ({
      ...prev,
      ownedRods: [...prev.ownedRods, rod.id],
      rodLevels: { ...(prev.rodLevels || {}), [rod.id]: 1 },
      equippedRodId: rod.id,
      equippedReelId: rod.canMountReel ? prev.equippedReelId : null,
    }));
    triggerHaptic?.('notification');
    return true;
  };

  const upgradeRod = (rod: RodTier) => {
    const currentLvl = (gear.rodLevels && gear.rodLevels[rod.id]) || 1;
    if (currentLvl >= 5) return false;
    const cost = getRodUpgradeCost(rod, currentLvl + 1);
    if (coins < cost) return false;
    if (!spendCoins(cost)) return false;

    setGear((prev) => ({
      ...prev,
      rodLevels: { ...(prev.rodLevels || {}), [rod.id]: currentLvl + 1 },
    }));
    triggerHaptic?.('notification');
    return true;
  };

  const equipRod = (rodId: string) => {
    const rod = ROD_TIERS.find((r) => r.id === rodId);
    setGear((prev) => ({
      ...prev,
      equippedRodId: rodId,
      equippedReelId: rod?.canMountReel ? prev.equippedReelId : null,
    }));
    triggerHaptic?.('selection');
  };

  // Действия: катушки
  const buyReel = (reel: ReelTier) => {
    if (coins < reel.basePrice || playerLevel < reel.levelReq) return false;
    if (!spendCoins(reel.basePrice)) return false;

    setGear((prev) => ({
      ...prev,
      ownedReels: [...prev.ownedReels, reel.id],
      reelLevels: { ...(prev.reelLevels || {}), [reel.id]: 1 },
      equippedReelId: currentRod.canMountReel ? reel.id : prev.equippedReelId,
    }));
    triggerHaptic?.('notification');
    return true;
  };

  const upgradeReel = (reel: ReelTier) => {
    const currentLvl = (gear.reelLevels && gear.reelLevels[reel.id]) || 1;
    if (currentLvl >= 3) return false;
    const cost = getReelUpgradeCost(reel, currentLvl + 1);
    if (coins < cost) return false;
    if (!spendCoins(cost)) return false;

    setGear((prev) => ({
      ...prev,
      reelLevels: { ...(prev.reelLevels || {}), [reel.id]: currentLvl + 1 },
    }));
    triggerHaptic?.('notification');
    return true;
  };

  const equipReel = (reelId: string | null) => {
    if (reelId && !currentRod.canMountReel) return;
    setGear((prev) => ({ ...prev, equippedReelId: reelId }));
    triggerHaptic?.('selection');
  };

  // Действия: лески
  const buyLine = (line: LineTier) => {
    if (coins < line.price || playerLevel < line.levelReq) return false;
    if (!spendCoins(line.price)) return false;

    setGear((prev) => {
      const currentStock = (prev.lineStock && prev.lineStock[line.id]) || 0;
      const newStock = currentStock + 1;
      const updatedStock = { ...(prev.lineStock || {}), [line.id]: newStock };

      // Если леска не была установлена или запасы старой лески исчерпаны — автоэкипируем купленную
      const isCurrentActiveValid =
        prev.equippedLineId && (updatedStock[prev.equippedLineId] || 0) > 0;

      return {
        ...prev,
        lineStock: updatedStock,
        equippedLineId: isCurrentActiveValid ? prev.equippedLineId : line.id,
      };
    });
    triggerHaptic?.('impact');
    return true;
  };

  const equipLine = (lineId: string) => {
    const stock = gear.lineStock?.[lineId] || 0;
    if (stock <= 0) return;
    setGear((prev) => ({ ...prev, equippedLineId: lineId }));
    triggerHaptic?.('selection');
  };

  // Обрыв лески — списание 1 штуки экипированной лески
  const breakLine = () => {
    if (!gear.equippedLineId) return;

    setGear((prev) => {
      const currentId = prev.equippedLineId;
      if (!currentId) return prev;

      const currentStock = (prev.lineStock && prev.lineStock[currentId]) || 0;
      const newStock = Math.max(0, currentStock - 1);
      const updatedStock = { ...(prev.lineStock || {}), [currentId]: newStock };

      let nextEquipped: string | null = currentId;
      if (newStock <= 0) {
        // Ищем другую доступную леску в запасах
        const altId = Object.keys(updatedStock).find((id) => updatedStock[id] > 0);
        nextEquipped = altId || null;
      }

      return {
        ...prev,
        lineStock: updatedStock,
        equippedLineId: nextEquipped,
      };
    });
  };

  return {
    gear,
    currentRod,
    rodLevel,
    currentRodStrength,
    currentReel,
    reelLevel,
    reelPullSpeed,
    currentLine,
    currentLineTensileKg,
    hasLineOnRod,
    breakLine,
    buyRod,
    upgradeRod,
    equipRod,
    buyReel,
    upgradeReel,
    equipReel,
    buyLine,
    equipLine,
  };
}