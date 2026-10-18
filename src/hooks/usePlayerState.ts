import { useState, useEffect, useCallback, useRef } from 'react';
import type { CaughtFishItem } from '../components/InventoryScreen';

export interface FishJournalEntry {
  fishId: string;
  firstCaughtAt: number;
  count: number;
  maxWeight: number;
  hasTrophy: boolean;
  trophyWeight?: number;
  trophyCaughtAt?: number;
}

export type FishJournal = Record<string, FishJournalEntry>;

export function usePlayerState() {
  const [userName] = useState<string>(() => {
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.first_name || 'Рыбак';
  });
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
  const [energy, setEnergy] = useState<number>(() => {
    const val = localStorage.getItem('fg_energy');
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0 ? parsed : 84;
  });
  const [gems, setGems] = useState<number>(() => {
    const val = localStorage.getItem('fg_gems');
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0 ? parsed : 120;
  });
  const maxEnergy = 100;
  const maxKeepnetCapacity = 15;

  // Рыболовный журнал (Энциклопедия видов и трофеев)
  const [journal, setJournal] = useState<FishJournal>(() => {
    try {
      const saved = localStorage.getItem('fg_fish_journal');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [hasClaimedAllSpeciesReward, setHasClaimedAllSpeciesReward] = useState<boolean>(() => {
    return localStorage.getItem('fg_all_species_claimed') === 'true';
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
      })) as CaughtFishItem[];
    } catch {
      return [];
    }
  });

  const expToNextLevel = Math.round(150 * Math.pow(1.25, level - 1));

  // Синхронизация энергии с localStorage
  useEffect(() => {
    localStorage.setItem('fg_energy', energy.toString());
  }, [energy]);

  // Синхронизация алмазов с localStorage
  useEffect(() => {
    localStorage.setItem('fg_gems', gems.toString());
  }, [gems]);

  // Инициализация Telegram WebApp
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
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

    // Обновляем рыболовный журнал (энциклопедию)
    setJournal((prevJournal) => {
      const fId = fish.fish.id;
      const prevEntry = prevJournal[fId];
      const isTrophy = (fish as any).sizeCategory === 'trophy' || (prevEntry?.hasTrophy ?? false);
      const updatedEntry: FishJournalEntry = {
        fishId: fId,
        firstCaughtAt: prevEntry ? prevEntry.firstCaughtAt : Date.now(),
        count: (prevEntry?.count || 0) + 1,
        maxWeight: Math.max(prevEntry?.maxWeight || 0, fish.weight),
        hasTrophy: isTrophy,
        trophyWeight:
          (fish as any).sizeCategory === 'trophy'
            ? Math.max(prevEntry?.trophyWeight || 0, fish.weight)
            : prevEntry?.trophyWeight,
        trophyCaughtAt:
          (fish as any).sizeCategory === 'trophy'
            ? Date.now()
            : prevEntry?.trophyCaughtAt,
      };

      const nextJournal = { ...prevJournal, [fId]: updatedEntry };
      localStorage.setItem('fg_fish_journal', JSON.stringify(nextJournal));
      return nextJournal;
    });

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

  const coinsRef = useRef(coins);
  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  // Списание монет
  const spendCoins = useCallback((amount: number): boolean => {
    if (coinsRef.current >= amount) {
      const nextCoins = coinsRef.current - amount;
      coinsRef.current = nextCoins;
      setCoins(nextCoins);
      return true;
    }
    return false;
  }, []);

  // Прямое начисление монет
  const addCoins = useCallback((amount: number) => {
    if (amount > 0) {
      const nextCoins = coinsRef.current + amount;
      coinsRef.current = nextCoins;
      setCoins(nextCoins);
    }
  }, []);

  // Прямое начисление опыта
  const addExp = useCallback((amount: number) => {
    if (amount <= 0) return;
    setExp((prev) => {
      const nextExp = prev + amount;
      if (nextExp >= expToNextLevel) {
        setLevel((lvl) => lvl + 1);
        return nextExp - expToNextLevel;
      }
      return nextExp;
    });
  }, [expToNextLevel]);

  const spendEnergy = useCallback((amount: number): boolean => {
    if (energy >= amount) {
      setEnergy((prev) => Math.max(0, prev - amount));
      return true;
    }
    return false;
  }, [energy]);

  const restoreEnergy = useCallback((amount: number) => {
    setEnergy((prev) => Math.min(maxEnergy, prev + amount));
  }, []);

  const claimAllSpeciesReward = useCallback((): boolean => {
    if (hasClaimedAllSpeciesReward) return false;
    // Начисляем 5 000 монет и 100 кристаллов за закрытие всех видов
    addCoins(5000);
    setGems((prev) => prev + 100);
    setHasClaimedAllSpeciesReward(true);
    localStorage.setItem('fg_all_species_claimed', 'true');
    return true;
  }, [hasClaimedAllSpeciesReward, addCoins]);

  return {
    userName,
    coins,
    gems,
    setGems,
    exp,
    level,
    expToNextLevel,
    energy,
    maxEnergy,
    maxKeepnetCapacity,
    spendEnergy,
    restoreEnergy,
    inventory,
    inventoryCount: inventory.length,
    journal,
    hasClaimedAllSpeciesReward,
    claimAllSpeciesReward,
    addCaughtFish,
    sellFish,
    sellAllFish,
    spendCoins,
    addCoins,
    addExp,
  };
}