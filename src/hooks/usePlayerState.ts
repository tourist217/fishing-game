import { useState, useEffect, useCallback, useRef } from 'react';
import type { CaughtFishItem } from '../components/InventoryScreen';
import { getTodayDateString } from '../types/quests';
import {
  getProvisionPrice,
  PROVISION_CONFIGS,
  type DailyProvisionsState,
  GEMS_ENERGY_DRINK_COST,
} from '../data/provisionsData';

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
  const maxEnergy = 100;
  const maxKeepnetCapacity = 15;
  const ENERGY_REGEN_INTERVAL_MS = 60000; // 1 единица энергии в 60 секунд (1 минута)

  const [lastEnergyTimestamp, setLastEnergyTimestamp] = useState<number>(() => {
    const val = localStorage.getItem('fg_energy_timestamp');
    const parsed = Number(val);
    return !isNaN(parsed) && parsed > 0 ? parsed : Date.now();
  });

  const [energy, setEnergy] = useState<number>(() => {
    // Единовременная инициализация для новых игроков и обновления версии:
    const hasInit = localStorage.getItem('fg_energy_v1_init') === 'true';
    if (!hasInit) {
      localStorage.setItem('fg_energy_v1_init', 'true');
      localStorage.setItem('fg_energy', '100');
      localStorage.setItem('fg_energy_timestamp', Date.now().toString());
      return 100;
    }

    const val = localStorage.getItem('fg_energy');
    const parsed = Number(val);
    const initialEnergy = !isNaN(parsed) && parsed >= 0 ? parsed : 100;

    // Расчёт оффлайн-восстановления энергии при загрузке игры
    const tsVal = localStorage.getItem('fg_energy_timestamp');
    const lastTs = Number(tsVal);
    if (!isNaN(lastTs) && lastTs > 0 && initialEnergy < maxEnergy) {
      const now = Date.now();
      const elapsed = Math.max(0, now - lastTs);
      const minutesPassed = Math.floor(elapsed / ENERGY_REGEN_INTERVAL_MS);
      if (minutesPassed > 0) {
        const restored = Math.min(maxEnergy, initialEnergy + minutesPassed);
        const remainder = elapsed % ENERGY_REGEN_INTERVAL_MS;
        const newTs = now - remainder;
        localStorage.setItem('fg_energy_timestamp', newTs.toString());
        localStorage.setItem('fg_energy', restored.toString());
        return restored;
      }
    } else if (isNaN(lastTs) || lastTs <= 0) {
      localStorage.setItem('fg_energy_timestamp', Date.now().toString());
    }
    return initialEnergy;
  });

  const [secondsToNextEnergy, setSecondsToNextEnergy] = useState<number>(0);

  const [gems, setGems] = useState<number>(() => {
    const val = localStorage.getItem('fg_gems');
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0 ? parsed : 120;
  });

  // Суточный учёт покупок чая и бутербродов (максимум 5 в день со ступенчатой ценой)
  const [dailyProvisions, setDailyProvisions] = useState<DailyProvisionsState>(() => {
    const today = getTodayDateString();
    try {
      const saved = localStorage.getItem('fg_daily_provisions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.date === today) {
          return {
            date: today,
            teaBoughtCount: Number(parsed.teaBoughtCount) || 0,
            sandwichBoughtCount: Number(parsed.sandwichBoughtCount) || 0,
          };
        }
      }
    } catch {
      // fallback
    }
    return { date: today, teaBoughtCount: 0, sandwichBoughtCount: 0 };
  });

  // Автоматический сброс счётчиков покупок еды в полночь при смене даты
  useEffect(() => {
    const checkDay = () => {
      const today = getTodayDateString();
      setDailyProvisions((prev) => {
        if (prev.date !== today) {
          const fresh = { date: today, teaBoughtCount: 0, sandwichBoughtCount: 0 };
          localStorage.setItem('fg_daily_provisions', JSON.stringify(fresh));
          return fresh;
        }
        return prev;
      });
    };
    const timer = setInterval(checkDay, 10000);
    return () => clearInterval(timer);
  }, []);

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
      return parsed.slice(0, maxKeepnetCapacity).map((item: any, idx: number) => ({
        ...item,
        uid: item.uid || `fish_${Date.now()}_${idx}`,
        price: Number(item.price) > 0 ? Number(item.price) : 5,
      })) as CaughtFishItem[];
    } catch {
      return [];
    }
  });

  const inventoryRef = useRef(inventory);
  useEffect(() => {
    inventoryRef.current = inventory;
  }, [inventory]);

  const expToNextLevel = Math.round(150 * Math.pow(1.25, level - 1));

  // Периодическое обновление энергии в реальном времени (+1 ед. каждые 60 секунд)
  useEffect(() => {
    const checkRegen = () => {
      setEnergy((curr) => {
        const now = Date.now();
        if (curr >= maxEnergy) {
          setSecondsToNextEnergy(0);
          return curr;
        }

        const elapsed = Math.max(0, now - lastEnergyTimestamp);
        const minutesPassed = Math.floor(elapsed / ENERGY_REGEN_INTERVAL_MS);

        if (minutesPassed > 0) {
          const nextVal = Math.min(maxEnergy, curr + minutesPassed);
          const remainder = elapsed % ENERGY_REGEN_INTERVAL_MS;
          const nextTs = now - remainder;
          setLastEnergyTimestamp(nextTs);
          localStorage.setItem('fg_energy_timestamp', nextTs.toString());
          localStorage.setItem('fg_energy', nextVal.toString());

          const secs = nextVal >= maxEnergy ? 0 : Math.ceil((ENERGY_REGEN_INTERVAL_MS - remainder) / 1000);
          setSecondsToNextEnergy(secs);
          return nextVal;
        } else {
          const secs = Math.ceil((ENERGY_REGEN_INTERVAL_MS - (elapsed % ENERGY_REGEN_INTERVAL_MS)) / 1000);
          setSecondsToNextEnergy(secs);
          return curr;
        }
      });
    };

    checkRegen();
    const timer = setInterval(checkRegen, 1000);
    return () => clearInterval(timer);
  }, [lastEnergyTimestamp, maxEnergy]);

  // Синхронизация энергии с localStorage
  useEffect(() => {
    localStorage.setItem('fg_energy', energy.toString());
  }, [energy]);

  // Синхронизация алмазов с localStorage
  useEffect(() => {
    localStorage.setItem('fg_gems', gems.toString());
  }, [gems]);

  // Инициализация Telegram WebApp и переход в Fullscreen
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();

      try {
        if (typeof tg.requestFullscreen === 'function') {
          tg.requestFullscreen();
        }
        if (typeof tg.disableVerticalSwipes === 'function') {
          tg.disableVerticalSwipes();
        }
        tg.setHeaderColor?.('#091325');
        tg.setBackgroundColor?.('#091325');
      } catch (err) {
        console.warn('Telegram WebApp fullscreen init:', err);
      }

      // Синхронизация отступов контента для избежания наложения нативных кнопок Telegram в Fullscreen
      const updateContentInsets = () => {
        try {
          const topInset = tg.contentSafeAreaInset?.top || tg.safeAreaInset?.top || 0;
          if (topInset > 0) {
            document.documentElement.style.setProperty('--tg-content-safe-area-inset-top', `${topInset}px`);
          }
          const bottomInset = tg.contentSafeAreaInset?.bottom || tg.safeAreaInset?.bottom || 0;
          if (bottomInset > 0) {
            document.documentElement.style.setProperty('--tg-content-safe-area-inset-bottom', `${bottomInset}px`);
          }
        } catch {}
      };

      updateContentInsets();
      tg.onEvent?.('fullscreen_changed', updateContentInsets);
      tg.onEvent?.('content_safe_area_changed', updateContentInsets);
      tg.onEvent?.('safe_area_changed', updateContentInsets);

      // Дополнительный вызов на первый клик/тап на случай, если Telegram требует взаимодействия пользователя
      const handleFirstInteraction = () => {
        try {
          if (typeof tg.requestFullscreen === 'function' && !tg.isFullscreen) {
            tg.requestFullscreen();
          }
          updateContentInsets();
        } catch {}
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
      };

      window.addEventListener('click', handleFirstInteraction, { once: true });
      window.addEventListener('touchstart', handleFirstInteraction, { once: true });

      return () => {
        tg.offEvent?.('fullscreen_changed', updateContentInsets);
        tg.offEvent?.('content_safe_area_changed', updateContentInsets);
        tg.offEvent?.('safe_area_changed', updateContentInsets);
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
      };
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

  // Добавление пойманной рыбы (строго с проверкой вместимости садка)
  const addCaughtFish = useCallback((fish: CaughtFishItem, gainedExp: number) => {
    if (inventoryRef.current.length >= maxKeepnetCapacity) {
      console.warn('Садок полон! Нельзя добавить рыбу сверх нормы.');
      return false;
    }

    const safeFish: CaughtFishItem = {
      ...fish,
      uid: fish.uid || Math.random().toString(36).substring(2, 9),
      price: Number(fish.price) > 0 ? Number(fish.price) : 5,
      caughtAt: fish.caughtAt || Date.now(),
    };

    setInventory((prev) => {
      if (prev.length >= maxKeepnetCapacity) {
        return prev;
      }
      return [safeFish, ...prev];
    });

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
        // Бонус за уровень: мгновенное полное восстановление энергии!
        setEnergy(maxEnergy);
        localStorage.setItem('fg_energy', maxEnergy.toString());
        return nextExp - expToNextLevel;
      }
      return nextExp;
    });
  }, [expToNextLevel, maxEnergy]);

  // Продажа одной рыбы (трофеи дают бонус в алмазах!)
  const sellFish = useCallback((uid: string, fallbackPrice?: number) => {
    const targetItem = inventory.find((item) => item.uid === uid);
    const amountToCredit = targetItem
      ? (Number(targetItem.price) || Number(fallbackPrice) || 1)
      : (Number(fallbackPrice) || 1);

    if (targetItem?.sizeCategory === 'trophy') {
      setGems((prev) => {
        const next = prev + 5;
        localStorage.setItem('fg_gems', next.toString());
        return next;
      });
    }

    setCoins((prevCoins) => prevCoins + amountToCredit);
    setInventory((prevInv) => prevInv.filter((item) => item.uid !== uid));
  }, [inventory]);

  // Продажа всего садка (трофеи приносят по +5 💎 за штуку!)
  const sellAllFish = useCallback((): number => {
    if (inventory.length === 0) return 0;

    const totalEarned = inventory.reduce(
      (sum, item) => sum + (Number(item.price) || 1),
      0
    );

    const trophyCount = inventory.filter((item) => item.sizeCategory === 'trophy').length;
    if (trophyCount > 0) {
      setGems((prev) => {
        const next = prev + trophyCount * 5;
        localStorage.setItem('fg_gems', next.toString());
        return next;
      });
    }

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
        // Бонус за уровень: мгновенное полное восстановление энергии!
        setEnergy(maxEnergy);
        localStorage.setItem('fg_energy', maxEnergy.toString());
        return nextExp - expToNextLevel;
      }
      return nextExp;
    });
  }, [expToNextLevel, maxEnergy]);

  const spendEnergy = useCallback((amount: number): boolean => {
    let success = false;
    setEnergy((prev) => {
      if (prev >= amount) {
        success = true;
        const next = Math.max(0, prev - amount);
        if (prev >= maxEnergy) {
          const now = Date.now();
          setLastEnergyTimestamp(now);
          localStorage.setItem('fg_energy_timestamp', now.toString());
        }
        localStorage.setItem('fg_energy', next.toString());
        return next;
      }
      return prev;
    });
    return success;
  }, [maxEnergy]);

  const restoreEnergy = useCallback((amount: number) => {
    setEnergy((prev) => {
      const next = Math.min(maxEnergy, prev + amount);
      if (next >= maxEnergy) {
        const now = Date.now();
        setLastEnergyTimestamp(now);
        localStorage.setItem('fg_energy_timestamp', now.toString());
      }
      localStorage.setItem('fg_energy', next.toString());
      return next;
    });
  }, [maxEnergy]);

  const buyProvision = useCallback((provisionId: 'tea' | 'sandwich'): boolean => {
    if (energy >= maxEnergy) return false;

    const today = getTodayDateString();
    let currentProvisions = dailyProvisions;
    if (currentProvisions.date !== today) {
      currentProvisions = { date: today, teaBoughtCount: 0, sandwichBoughtCount: 0 };
    }

    const boughtCount = provisionId === 'tea' ? currentProvisions.teaBoughtCount : currentProvisions.sandwichBoughtCount;
    const price = getProvisionPrice(provisionId, boughtCount);
    if (price === null) return false; // Лимит 5 покупок на сегодня исчерпан
    if (coins < price) return false;

    if (spendCoins(price)) {
      const config = PROVISION_CONFIGS[provisionId];
      restoreEnergy(config.energyBonus);

      const nextProvisions = {
        ...currentProvisions,
        date: today,
        teaBoughtCount: provisionId === 'tea' ? currentProvisions.teaBoughtCount + 1 : currentProvisions.teaBoughtCount,
        sandwichBoughtCount: provisionId === 'sandwich' ? currentProvisions.sandwichBoughtCount + 1 : currentProvisions.sandwichBoughtCount,
      };
      setDailyProvisions(nextProvisions);
      localStorage.setItem('fg_daily_provisions', JSON.stringify(nextProvisions));
      return true;
    }
    return false;
  }, [coins, energy, maxEnergy, dailyProvisions, spendCoins, restoreEnergy]);

  // Восстановление полного запаса энергии за кристаллы (20 💎)
  const buyEnergyWithGems = useCallback((): boolean => {
    if (energy >= maxEnergy) return false;
    if (gems < GEMS_ENERGY_DRINK_COST) return false;

    setGems((prev) => {
      const nextGems = prev - GEMS_ENERGY_DRINK_COST;
      localStorage.setItem('fg_gems', nextGems.toString());
      return nextGems;
    });

    restoreEnergy(maxEnergy);
    return true;
  }, [gems, energy, maxEnergy, restoreEnergy]);

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
    secondsToNextEnergy,
    dailyProvisions,
    maxKeepnetCapacity,
    isKeepnetFull: inventory.length >= maxKeepnetCapacity,
    spendEnergy,
    restoreEnergy,
    buyProvision,
    buyEnergyWithGems,
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