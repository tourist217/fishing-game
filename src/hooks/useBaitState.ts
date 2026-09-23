import { useState, useEffect, useCallback } from 'react';

export interface BaitItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  description: string;
}

export const AVAILABLE_BAITS: BaitItem[] = [
  { id: 'worm', name: 'Червь', price: 5, icon: '🪱', description: 'Универсальная наживка для любой рыбы' },
  { id: 'bread', name: 'Хлеб', price: 3, icon: '🍞', description: 'Отлично подходит для белой рыбы' },
  { id: 'dough', name: 'Тесто', price: 4, icon: '🥟', description: 'Любимое лакомство карася и плотвы' },
  { id: 'corn', name: 'Кукуруза', price: 8, icon: '🌽', description: 'Привлекает карпа, сазана и амура' },
  { id: 'maggot', name: 'Опарыш', price: 6, icon: '🐛', description: 'Бойкая личинка для плотвы и леща' },
  { id: 'bloodworm', name: 'Мотыль', price: 7, icon: '🦟', description: 'Деликатес для пескаря и мелкой рыбы' },
  { id: 'livebait', name: 'Живец', price: 15, icon: '🐟', description: 'Наживка для хищников: щука, окунь, судак, сом' },
];

export interface UpgradesState {
  baitCapacityLevel: number;
  hookSharpenLevel: number;
  reelOilLevel: number;
}

export function useBaitState(
  coins?: number,
  spendCoins?: (amount: number) => boolean,
  triggerHaptic?: (type: 'impact' | 'notification' | 'selection') => void
) {
  // 1. Состояние запаса наживок
  const [baits, setBaits] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('fg_baits');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return {
      worm: 10,
      bread: 5,
      dough: 5,
      corn: 0,
      maggot: 0,
      bloodworm: 0,
      livebait: 0,
    };
  });

  // 2. Выбранная на крючке наживка
  const [selectedBaitId, setSelectedBaitId] = useState<string>('worm');

  // 3. Состояние улучшений
  const [upgrades, setUpgrades] = useState<UpgradesState>(() => {
    try {
      const saved = localStorage.getItem('fg_upgrades');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return {
      baitCapacityLevel: 0,
      hookSharpenLevel: 0,
      reelOilLevel: 0,
    };
  });

  // Автосохранение наживок
  useEffect(() => {
    localStorage.setItem('fg_baits', JSON.stringify(baits));
  }, [baits]);

  // Автосохранение улучшений
  useEffect(() => {
    localStorage.setItem('fg_upgrades', JSON.stringify(upgrades));
  }, [upgrades]);

  // Расчёт текущей вместимости коробки для наживок
  const currentBaitCapacity = 20 + upgrades.baitCapacityLevel * 10;

  // Безопасная покупка наживки (с проверкой денег, вместимости и списанием)
  const buyBait = useCallback(
    (baitId: string, count: number = 5): boolean => {
      const item = AVAILABLE_BAITS.find((b) => b.id === baitId);
      if (!item) return false;

      const totalCost = item.price;

      // Проверяем баланс игрока
      if (typeof coins === 'number' && coins < totalCost) {
        triggerHaptic?.('notification');
        return false;
      }

      // Проверяем вместимость коробки
      const totalBaitsCount = Object.values(baits).reduce((sum, val) => sum + val, 0);
      if (totalBaitsCount + count > currentBaitCapacity) {
        triggerHaptic?.('notification');
        return false;
      }

      // Списываем монеты
      if (spendCoins) {
        const success = spendCoins(totalCost);
        if (!success) {
          return false;
        }
      }

      // Начисляем наживку
      setBaits((prevBaits) => ({
        ...prevBaits,
        [baitId]: (prevBaits[baitId] || 0) + count,
      }));

      triggerHaptic?.('impact');
      return true;
    },
    [coins, currentBaitCapacity, baits, spendCoins, triggerHaptic]
  );

  // Синхронный расход наживки при забросе удочки
  const consumeBait = useCallback(
    (baitId: string): boolean => {
      const currentCount = baits[baitId] || 0;
      if (currentCount <= 0) {
        return false;
      }

      setBaits((prevBaits) => ({
        ...prevBaits,
        [baitId]: Math.max(0, (prevBaits[baitId] || 0) - 1),
      }));

      return true;
    },
    [baits]
  );

  // Выбор активной наживки
  const selectBait = useCallback((baitId: string) => {
    setSelectedBaitId(baitId);
  }, []);

  // Покупка улучшений (коробка, заточка, масло)
  const buyUpgrade = useCallback(
    (type: keyof UpgradesState, cost: number): boolean => {
      if (typeof coins === 'number' && coins < cost) {
        return false;
      }

      if (spendCoins) {
        const spent = spendCoins(cost);
        if (!spent) return false;
      }

      setUpgrades((prev) => ({
        ...prev,
        [type]: prev[type] + 1,
      }));

      triggerHaptic?.('notification');
      return true;
    },
    [coins, spendCoins, triggerHaptic]
  );

  return {
    baits,
    selectedBaitId,
    setSelectedBaitId,
    selectBait,
    buyBait,
    consumeBait,
    upgrades,
    currentBaitCapacity,
    buyUpgrade,
  };
}