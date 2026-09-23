import { useState, useEffect } from 'react';
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

  // Инициализация Telegram данных игрока
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

  // Добавление пойманной рыбы и опыта в профиль
  const addCaughtFish = (fish: CaughtFishItem, gainedExp: number) => {
    setInventory((prev) => [fish, ...prev]);

    setExp((prev) => {
      const nextExp = prev + gainedExp;
      if (nextExp >= expToNextLevel) {
        setLevel((lvl) => lvl + 1);
        return nextExp - expToNextLevel;
      }
      return nextExp;
    });
  };

  // Продажа одной рыбы
  const sellFish = (uid: string, price: number) => {
    setCoins((c) => c + price);
    setInventory((inv) => inv.filter((item) => item.uid !== uid));
  };

  // Продажа всего садка
  const sellAllFish = (): number => {
    const total = inventory.reduce((sum, item) => sum + item.price, 0);
    setCoins((c) => c + total);
    setInventory([]);
    return total;
  };

  // Списание монет (для покупок снастей, наживок, улучшений)
  const spendCoins = (amount: number): boolean => {
    if (coins < amount) return false;
    setCoins((c) => c - amount);
    return true;
  };

  // Прямое начисление монет (награды, бонусы)
  const addCoins = (amount: number) => {
    setCoins((c) => c + amount);
  };

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