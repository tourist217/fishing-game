import { useState, useEffect, useCallback, useRef } from 'react';

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

  // Вместимость одной банки (30 базово + 15 за каждый уровень прокачки)
  const currentBaitCapacity = 30 + upgrades.baitCapacityLevel * 15;

  const baitsRef = useRef(baits);
  baitsRef.current = baits;

  // Умная покупка наживки (с частичным добором до лимита)
  const buyBait = useCallback(
    (baitId: string, requestedCount: number = 5, packPrice?: number): boolean => {
      const currentCount = baitsRef.current[baitId] || 0;
      const spaceLeft = Math.max(0, currentBaitCapacity - currentCount);

      // Если банка уже полная — покупка блокируется
      if (spaceLeft <= 0) {
        triggerHaptic?.('notification');
        return false;
      }

      // Определяем, сколько реально покупаем (не больше свободного места)
      const countToAdd = Math.min(requestedCount, spaceLeft);

      // Рассчитываем базовую цену за пачку
      let fullPackCost = packPrice;
      if (typeof fullPackCost !== 'number') {
        const item = AVAILABLE_BAITS.find((b) => b.id === baitId);
        fullPackCost = item ? item.price : 20;
      }

      // Пропорциональный расчёт цены: (цена пачки / размер пачки) * реальное количество
      const pricePerUnit = fullPackCost / requestedCount;
      const actualCost = Math.max(1, Math.round(countToAdd * pricePerUnit));

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