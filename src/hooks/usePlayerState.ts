import { useState, useEffect, useCallback } from 'react';
import type { CaughtFishItem } from '../components/InventoryScreen';

export function usePlayerState() {
  const [userName, setUserName] = useState<string>('Рыбак');
  const [coins, setCoins] = useState<number>(() => Number(localStorage.getItem('fg_coins')) || 0);
  const [exp, setExp] = useState<number>(() => Number(localStorage.getItem('fg_exp')) || 0);
  const [level, setLevel] = useState<number>(() => Number(localStorage.getItem('fg_level')) || 1);
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

  // Синхронизация localStorage
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

  // Добавление пойманной рыбы (стабильный колбэк)
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
    setCoins((c) => c + price);
    setInventory((inv) => inv.filter((item) => item.uid !== uid));
  }, []);

  // Продажа всего садка
  const sellAllFish = useCallback((): number => {
    let totalEarned = 0;
    setInventory((inv) => {
      totalEarned = inv.reduce((sum, item) => sum + item.price, 0);
      return [];
    });
    setCoins((c) => c + totalEarned);
    return totalEarned;
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
    setCoins((c) => c + amount);
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