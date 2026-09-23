import { useState, useEffect, useCallback } from 'react';
import type { CaughtFishItem } from '../components/InventoryScreen';

export function usePlayerState() {
  const [userName, setUserName] = useState<string>('Рыбак');
  const [coins, setCoins] = useState<number>(() => {
    const val = localStorage.getItem('fg_coins');
    return val ? Math.max(0, Number(val)) : 0;
  });
  const [exp, setExp] = useState<number>(() => {
    const val = localStorage.getItem('fg_exp');
    return val ? Math.max(0, Number(val)) : 0;
  });
  const [level, setLevel] = useState<number>(() => {
    const val = localStorage.getItem('fg_level');
    return val ? Math.max(1, Number(val)) : 1;
  });
  const [inventory, setInventory] = useState<CaughtFishItem[]>(() => {
    try {
      const saved = localStorage.getItem('fg_inventory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const expToNextLevel = level * 100;

  // Инициализация Telegram
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user?.first_name) {
        setUserName(tg.initDataUnsafe.user.first_name);
      }
    }
  }, []);

  // Синхронизация с localStorage
  useEffect(() => {
    localStorage.setItem('fg_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('fg_exp', exp.toString());
  }, [exp]);

  useEffect(() => {
    localStorage.setItem('fg_level', level.toString());
  }, [level]);

  useEffect(() => {
    localStorage.setItem('fg_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Добавление пойманной рыбы и опыта
  const addCaughtFish = useCallback((fish: CaughtFishItem, gainedExp: number) => {
    setInventory((prev) => [fish, ...prev]);

    setExp((prev) => {
      const nextExp = prev + gainedExp;
      if (nextExp >= expToNextLevel) {
        setLevel((lvl) => lvl + 1);
        return nextExp - expToNextLevel;
      }
      return nextExp;
    });
  }, [expToNextLevel]);

  // Продажа одной рыбы
  const sellFish = useCallback((uid: string, price: number) => {
    if (price <= 0) return;
    setCoins((prevCoins) => prevCoins + price);
    setInventory((prevInv) => prevInv.filter((item) => item.uid !== uid));
  }, []);

  // Продажа всего садка
  const sellAllFish = useCallback((): number => {
    // Вычисляем точную сумму прямо из текущего массива
    let earned = 0;
    setInventory((prevInv) => {
      earned = prevInv.reduce((sum, item) => sum + (item.price || 0), 0);
      return [];
    });
    
    if (earned > 0) {
      setCoins((prevCoins) => prevCoins + earned);
    }
    return earned;
  }, []);

  // Списание монет
  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setCoins((prev) => {
      if (prev >= amount) {
        success = true;
        return prev - amount;
      }
      return prev;
    });
    return success;
  }, []);

  // Прямое начисление
  const addCoins = useCallback((amount: number) => {
    if (amount > 0) {
      setCoins((prev) => prev + amount);
    }
  }, []);

  return {
    userName,
    coins,
    exp,
    level,
    expToNextLevel,
    inventory,
    inventoryCount: inventory.length,
    addCaughtFish,
    sellFish,
    sellAllFish,
    spendCoins,
    addCoins,
  };
}