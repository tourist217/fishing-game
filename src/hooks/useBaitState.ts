import { useState, useEffect, useCallback, useRef } from 'react';

export interface BaitItem {
  id: string;
  name: string;
  price: number;
  levelReq: number;
  icon: string;
  image: string;
  description: string;
}

export const AVAILABLE_BAITS: BaitItem[] = [
  { id: 'worm', name: 'Червь', price: 2, levelReq: 1, icon: '🪱', image: '/assets/baits/worm.png', description: 'Универсальная насадка для карася, плотвы, некрупного окуня' },
  { id: 'bread', name: 'Хлеб', price: 1, levelReq: 1, icon: '🍞', image: '/assets/baits/bread.png', description: 'Отлично подходит для некрупной белой рыбы' },
  { id: 'dough', name: 'Тесто', price: 2, levelReq: 1, icon: '🥟', image: '/assets/baits/dough.png', description: 'Любимое лакомство карася и плотвы' },
  { id: 'maggot', name: 'Опарыш', price: 3, levelReq: 3, icon: '🐛', image: '/assets/baits/maggot.png', description: 'Бойкая личинка для плотвы, краснопёрки и подлещика' },
  { id: 'bloodworm', name: 'Мотыль', price: 3, levelReq: 3, icon: '🦟', image: '/assets/baits/bloodworm.png', description: 'Нежный деликатес для пескаря и мелкого окуня-матросика' },
  { id: 'livebait', name: 'Живец', price: 8, levelReq: 6, icon: '🐟', image: '/assets/baits/livebait.png', description: 'Живой малёк для отборных хищников: щука, крупный окунь, судак' },
  { id: 'corn', name: 'Кукуруза', price: 5, levelReq: 9, icon: '🌽', image: '/assets/baits/corn.png', description: 'Сладкие зерна для карпа, сазана и крупного амура' },
];

export interface BaitCapacityTier {
  level: number;
  capacity: number;
  reqPlayerLevel: number;
  cost: number;
}

export const BAIT_CAPACITY_TIERS: BaitCapacityTier[] = [
  { level: 0, capacity: 3, reqPlayerLevel: 1, cost: 0 },
  { level: 1, capacity: 5, reqPlayerLevel: 3, cost: 1200 },
  { level: 2, capacity: 8, reqPlayerLevel: 6, cost: 3500 },
  { level: 3, capacity: 11, reqPlayerLevel: 10, cost: 7500 },
  { level: 4, capacity: 15, reqPlayerLevel: 15, cost: 15000 },
];

export function getBaitCapacity(upgradeLevel: number): number {
  const safeLvl = Math.max(0, Math.min(upgradeLevel, BAIT_CAPACITY_TIERS.length - 1));
  return BAIT_CAPACITY_TIERS[safeLvl].capacity;
}

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
  // 1. Количество каждой наживки
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

  // 2. Выбранная активная насадка
  const [selectedBaitId, setSelectedBaitId] = useState<string>('worm');

  // 3. Улучшения
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

  // Вместимость одной банки (3 шт. на старте, до 15 шт. на макс. уровне)
  const currentBaitCapacity = getBaitCapacity(upgrades.baitCapacityLevel);

  const baitsRef = useRef(baits);
  baitsRef.current = baits;

  // Умная покупка наживки (с частичным добором до лимита)
  const buyBait = useCallback(
    (baitId: string, requestedCount: number = 3, packPrice?: number): boolean => {
      const currentCount = baitsRef.current[baitId] || 0;
      const spaceLeft = Math.max(0, currentBaitCapacity - currentCount);

      // Если банка уже полная — покупка блокируется
      if (spaceLeft <= 0) {
        triggerHaptic?.('notification');
        return false;
      }

      // Определяем, сколько реально покупаем (не больше свободного места)
      const countToAdd = Math.min(requestedCount, spaceLeft);

      // Расчёт цены
      const item = AVAILABLE_BAITS.find((b) => b.id === baitId);
      const unitPrice = item ? item.price : 2;
      const actualCost = typeof packPrice === 'number'
        ? Math.max(1, Math.round(countToAdd * (packPrice / requestedCount)))
        : countToAdd * unitPrice;

      // Проверяем баланс
      if (typeof coins === 'number' && coins < actualCost) {
        triggerHaptic?.('notification');
        return false;
      }

      // Списываем точную сумму
      if (spendCoins) {
        const success = spendCoins(actualCost);
        if (!success) {
          triggerHaptic?.('notification');
          return false;
        }
      }

      // Начисляем купленное количество
      setBaits((prevBaits) => {
        const next = {
          ...prevBaits,
          [baitId]: (prevBaits[baitId] || 0) + countToAdd,
        };
        baitsRef.current = next;
        return next;
      });

      triggerHaptic?.('impact');
      return true;
    },
    [currentBaitCapacity, coins, spendCoins, triggerHaptic]
  );

  // Синхронный расход наживки при забросе удочки
  const consumeBait = useCallback(
    (baitId: string): boolean => {
      const currentCount = baitsRef.current[baitId] || 0;
      if (currentCount <= 0) {
        return false;
      }

      const nextBaits = {
        ...baitsRef.current,
        [baitId]: Math.max(0, currentCount - 1),
      };
      baitsRef.current = nextBaits;
      setBaits(nextBaits);
      localStorage.setItem('fg_baits', JSON.stringify(nextBaits));

      return true;
    },
    []
  );

  // Выбор наживки
  const selectBait = useCallback((baitId: string) => {
    setSelectedBaitId(baitId);
  }, []);

  // Покупка улучшений мастерской
  const buyUpgrade = useCallback(
    (type: keyof UpgradesState, cost: number): boolean => {
      if (typeof coins === 'number' && coins < cost) {
        triggerHaptic?.('notification');
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