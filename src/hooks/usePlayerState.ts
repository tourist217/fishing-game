import { useState, useEffect, useCallback } from 'react';
import type { CaughtFishItem } from '../components/InventoryScreen';

export function usePlayerState() {
  const [userName, setUserName] = useState<string>('Рыбак');
  const [coins, setCoins] = useState<number>(() => {
    const val = localStorage.getItem('fg_coins');
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
  });
  const [exp, setExp] = useState<number>(() => {
    const val = localStorage.getItem('fg_exp');
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
  });
  const [level, setLevel] = useState<number>(() => {
    const val = localStorage.getItem('fg_level');
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 1 ? parsed : 1;
  });
  const [inventory, setInventory] = useState<CaughtFishItem[]>(() => {
    try {
      const saved = localStorage.getItem('fg_inventory');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item: any, idx: number) => ({
        ...item,
        uid: item.uid || `fish_${Date.now()}_${idx}`,
        price: Number(item.price) > 0 ? Number(item.price) : 5,
      }));
    } catch {
      return [];
    }
  });

  const expToNextLevel = level * 100;

  // Инициализация Telegram данных
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

  // Добавление пойманной рыбы
  const addCaughtFish = useCallback((fish: CaughtFishItem, gainedExp: number) => {
    const safeFish: CaughtFishItem = {
      ...fish,
      uid: fish.uid || Math.random().toString(36).substring(2, 9),
      price: Number(fish.price) > 0 ? Number(fish.price) : 5,
      caughtAt: fish.caughtAt || Date.now(),
    };

    setInventory((prev) => [safeFish, ...prev]);

    setExp((prev) => {
      const nextExp = prev + (gainedExp || 10);
      if (nextExp >= expToNextLevel) {
        setLevel((lvl) => lvl + 1);
        return nextExp - expToNextLevel;
      }
      return nextExp;
    });
  }, [expToNextLevel]);

  // Продажа одной рыбы
  const sellFish = useCallback((uid: string, fallbackPrice?: number) => {
    const targetItem = inventory.find((item) => item.uid === uid);
    const amountToCredit = targetItem
      ? (Number(targetItem.price) || Number(fallbackPrice) || 1)
      : (Number(fallbackPrice) || 1);

    setCoins((prevCoins) => prevCoins + amountToCredit);
    setInventory((prevInv) => prevInv.filter((item) => item.uid !== uid));
  }, [inventory]);

  // Продажа всего садка (прямой расчёт без сайд-эффектов в апдейтере)
  const sellAllFish = useCallback((): number => {
    if (inventory.length === 0) return 0;

    const totalEarned = inventory.reduce(
      (sum, item) => sum + (Number(item.price) || 1),
      0
    );

    setCoins((prevCoins) => prevCoins + totalEarned);
    setInventory([]);

    return totalEarned;
  }, [inventory]);

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

  // Прямое начисление монет
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