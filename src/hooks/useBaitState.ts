import { useState, useEffect } from 'react';
import { INITIAL_BAIT_INVENTORY } from '../baitData';
import type { UpgradesState } from '../components/ShopScreen';

const DEFAULT_UPGRADES: UpgradesState = {
  baitCapacityLevel: 0,
  hookSharpenLevel: 0,
  reelOilLevel: 0,
};

const BAIT_CAPACITY_MAP = [10, 20, 30, 50];
const WORM_REGEN_INTERVAL_MS = 60 * 60 * 1000; // 1 час

export function useBaitState(
  coins: number,
  spendCoins: (amount: number) => boolean,
  triggerHaptic?: (type: 'impact' | 'notification' | 'selection') => void
) {
  const [baits, setBaits] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('fg_baits');
      return saved ? JSON.parse(saved) : INITIAL_BAIT_INVENTORY;
    } catch {
      return INITIAL_BAIT_INVENTORY;
    }
  });

  const [selectedBaitId, setSelectedBaitId] = useState<string>('worm');

  const [upgrades, setUpgrades] = useState<UpgradesState>(() => {
    try {
      const saved = localStorage.getItem('fg_upgrades');
      return saved ? JSON.parse(saved) : DEFAULT_UPGRADES;
    } catch {
      return DEFAULT_UPGRADES;
    }
  });

  const currentBaitCapacity = BAIT_CAPACITY_MAP[upgrades.baitCapacityLevel] || 10;

  // Автосохранение в localStorage
  useEffect(() => {
    localStorage.setItem('fg_baits', JSON.stringify(baits));
  }, [baits]);

  useEffect(() => {
    localStorage.setItem('fg_upgrades', JSON.stringify(upgrades));
  }, [upgrades]);

  // Пассивный доход червей раз в час
  useEffect(() => {
    const now = Date.now();
    const lastRegenTime = Number(localStorage.getItem('fg_last_worm_time')) || now;
    const diffMs = now - lastRegenTime;

    if (diffMs >= WORM_REGEN_INTERVAL_MS) {
      const generatedWorms = Math.floor(diffMs / WORM_REGEN_INTERVAL_MS);
      const remainingMs = diffMs % WORM_REGEN_INTERVAL_MS;

      setBaits((prev) => {
        const currentWorms = prev.worm || 0;
        const newWorms = Math.min(currentBaitCapacity, currentWorms + generatedWorms);
        return { ...prev, worm: newWorms };
      });

      localStorage.setItem('fg_last_worm_time', (now - remainingMs).toString());
    } else if (!localStorage.getItem('fg_last_worm_time')) {
      localStorage.setItem('fg_last_worm_time', now.toString());
    }

    const interval = setInterval(() => {
      const checkNow = Date.now();
      const lastCheck = Number(localStorage.getItem('fg_last_worm_time')) || checkNow;
      if (checkNow - lastCheck >= WORM_REGEN_INTERVAL_MS) {
        setBaits((prev) => {
          const currentWorms = prev.worm || 0;
          if (currentWorms < currentBaitCapacity) {
            return { ...prev, worm: currentWorms + 1 };
          }
          return prev;
        });
        localStorage.setItem('fg_last_worm_time', checkNow.toString());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentBaitCapacity]);

  // Покупка наживки в магазине
  const buyBait = (baitId: string, amount: number, totalCost: number): boolean => {
    if (coins < totalCost) return false;
    const currentCount = baits[baitId] || 0;
    if (currentCount + amount > currentBaitCapacity) return false;
    if (!spendCoins(totalCost)) return false;

    setBaits((prev) => ({
      ...prev,
      [baitId]: (prev[baitId] || 0) + amount,
    }));
    triggerHaptic?.('impact');
    return true;
  };

  // Покупка апгрейда в мастерской
  const buyUpgrade = (type: keyof UpgradesState, cost: number): boolean => {
    if (coins < cost) return false;
    if (!spendCoins(cost)) return false;

    setUpgrades((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
    triggerHaptic?.('notification');
    return true;
  };

  // Расход наживки при забросе удочки
  const consumeBait = (baitId: string): boolean => {
    const currentCount = baits[baitId] || 0;
    if (currentCount <= 0) return false;

    setBaits((prev) => ({
      ...prev,
      [baitId]: Math.max(0, (prev[baitId] || 0) - 1),
    }));
    return true;
  };

  const selectBait = (baitId: string) => {
    setSelectedBaitId(baitId);
    triggerHaptic?.('selection');
  };

  return {
    baits,
    selectedBaitId,
    upgrades,
    currentBaitCapacity,
    selectBait,
    buyBait,
    buyUpgrade,
    consumeBait,
  };
}