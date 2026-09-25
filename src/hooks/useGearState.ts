import { useState, useEffect } from 'react';
import {
  ROD_TIERS,
  REEL_TIERS,
  LINE_TIERS,
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
      const lineExists = LINE_TIERS.some((l) => l.id === parsed.equippedLineId);
      if (!rodExists || !lineExists) return INITIAL_PLAYER_GEAR;
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

  const currentLine: LineTier =
    LINE_TIERS.find((l) => l.id === gear.equippedLineId) || LINE_TIERS[0];

  // Действия: покупка, апгрейд, экипировка удилища
  const buyRod = (rod: RodTier) => {
    if (gear.ownedRods.includes(rod.id)) {
      // Уже куплено — просто экипируем
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

    setGear((prev) => ({
      ...prev,
      lineStock: {
        ...(prev.lineStock || {}),
        [line.id]: ((prev.lineStock && prev.lineStock[line.id]) || 0) + 1,
      },
      equippedLineId: prev.equippedLineId || line.id,
    }));
    triggerHaptic?.('impact');
    return true;
  };

  const equipLine = (lineId: string) => {
    setGear((prev) => ({ ...prev, equippedLineId: lineId }));
    triggerHaptic?.('selection');
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