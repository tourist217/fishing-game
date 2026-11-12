import { useState, useEffect, useCallback, useRef } from 'react';
import { getRandomFish, type GeneratedFishResult } from '../fishData';
import { getCurrentWeather } from '../utils/weatherTime';
import type { FishJournal } from './usePlayerState';
import type { CaughtFishItem } from '../components/InventoryScreen';
import { handleCatchForTournament } from '../services/tournamentService';

export const OFFLINE_MINUTES_REQUIRED = 30;
export const OFFLINE_MS_REQUIRED = OFFLINE_MINUTES_REQUIRED * 60 * 1000;

export interface FeederCatchItem {
  hookIndex: number;
  baitId: string;
  outcome: 'caught' | 'escaped' | 'junk';
  fish?: GeneratedFishResult;
  escapeReason?: string;
  junkName?: string;
  junkIcon?: string;
  junkValue?: number;
  junkExp?: number;
  junkWeight?: number;
}

export interface FeederStrengthTier {
  level: number;
  strengthKg: number;
  cost: number;
}

export const FEEDER_STRENGTH_TIERS: FeederStrengthTier[] = [
  { level: 1, strengthKg: 1.5, cost: 0 },
  { level: 2, strengthKg: 3.0, cost: 600 },
  { level: 3, strengthKg: 5.5, cost: 1500 },
  { level: 4, strengthKg: 9.0, cost: 3500 },
  { level: 5, strengthKg: 14.0, cost: 8000 },
  { level: 6, strengthKg: 22.0, cost: 18000 },
  { level: 7, strengthKg: 35.0, cost: 35000 },
  { level: 8, strengthKg: 55.0, cost: 70000 },
  { level: 9, strengthKg: 80.0, cost: 120000 },
];

export interface FeederSlotConfig {
  slotIndex: number;
  name: string;
  levelReq: number;
  cost: number;
}

export const FEEDER_SLOTS_CONFIG: FeederSlotConfig[] = [
  { slotIndex: 0, name: 'Фидер #1 (Озёрный)', levelReq: 4, cost: 1000 },
  { slotIndex: 1, name: 'Фидер #2 (Речной)', levelReq: 13, cost: 15000 },
  { slotIndex: 2, name: 'Фидер #3 (Трофейный)', levelReq: 21, cost: 50000 },
];

export interface FeederSlotData {
  slotIndex: number;
  isUnlocked: boolean;
  strengthLevel: number; // 1..9
  unlockedHooks: number; // 1, 2, or 3
  hookBaits: (string | null)[]; // 3 items
  isCast: boolean;
  castTimestamp: number | null;
  castLocationId: string | null;
  pendingCatches: FeederCatchItem[] | null;
}

const DEFAULT_FEEDERS: FeederSlotData[] = [
  {
    slotIndex: 0,
    isUnlocked: false,
    strengthLevel: 1,
    unlockedHooks: 1,
    hookBaits: [null, null, null],
    isCast: false,
    castTimestamp: null,
    castLocationId: 'loc_village_pond',
    pendingCatches: null,
  },
  {
    slotIndex: 1,
    isUnlocked: false,
    strengthLevel: 1,
    unlockedHooks: 1,
    hookBaits: [null, null, null],
    isCast: false,
    castTimestamp: null,
    castLocationId: 'loc_village_pond',
    pendingCatches: null,
  },
  {
    slotIndex: 2,
    isUnlocked: false,
    strengthLevel: 1,
    unlockedHooks: 1,
    hookBaits: [null, null, null],
    isCast: false,
    castTimestamp: null,
    castLocationId: 'loc_village_pond',
    pendingCatches: null,
  },
];

export function useFeederState(
  playerLevel: number,
  coins: number,
  gems: number,
  spendCoins?: (amount: number) => boolean,
  spendGems?: (amount: number) => boolean,
  addCoins?: (amount: number) => void,
  consumeBait?: (baitId: string) => boolean,
  addCaughtFish?: (fish: CaughtFishItem, exp: number) => boolean | void | false | undefined,
  journal?: FishJournal,
  triggerHaptic?: (type: 'impact' | 'notification' | 'selection') => void
) {
  // Feeders state
  const [feeders, setFeeders] = useState<FeederSlotData[]>(() => {
    try {
      const saved = localStorage.getItem('fg_feeders_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 3) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_FEEDERS;
  });

  const feedersRef = useRef(feeders);
  feedersRef.current = feeders;

  // Persist feeders
  useEffect(() => {
    localStorage.setItem('fg_feeders_data', JSON.stringify(feeders));
  }, [feeders]);

  // Keep track of offline absence
  const [_lastActiveTs, setLastActiveTs] = useState<number>(() => {
    const val = localStorage.getItem('fg_feeder_last_active');
    const parsed = Number(val);
    return !isNaN(parsed) && parsed > 0 ? parsed : Date.now();
  });

  // Track active heartbeats and unload
  useEffect(() => {
    const updateActive = () => {
      const now = Date.now();
      localStorage.setItem('fg_feeder_last_active', now.toString());
      setLastActiveTs(now);
    };

    const interval = setInterval(updateActive, 10000); // every 10s

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        updateActive();
      }
    };

    const handleBeforeUnload = () => {
      updateActive();
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Offline Catch Generator
  const generateCatchesForFeeder = useCallback(
    (feeder: FeederSlotData): FeederCatchItem[] => {
      const strengthTier = FEEDER_STRENGTH_TIERS[feeder.strengthLevel - 1] || FEEDER_STRENGTH_TIERS[0];
      const maxFeederStrength = strengthTier.strengthKg;
      let remainingStrength = maxFeederStrength;
      const catches: FeederCatchItem[] = [];

      const env = getCurrentWeather();
      const locationId = feeder.castLocationId || 'loc_village_pond';

      for (let h = 0; h < feeder.unlockedHooks; h++) {
        const baitId = feeder.hookBaits[h];
        if (!baitId) continue; // hook was empty

        const roll = Math.random();

        // 1. Мусор (3% шанс: 0.00 .. 0.03)
        if (roll < 0.03) {
          const isBoot = Math.random() < 0.5;
          const junkName = isBoot ? 'Ржавый сапог' : 'Речная коряга';
          const junkIcon = isBoot ? '👢' : '🪵';
          const junkVal = isBoot ? 5 : 3;
          const junkExp = isBoot ? 5 : 3;
          const junkW = isBoot ? 0.75 : 1.2;
          remainingStrength = Math.max(0, remainingStrength - junkW);

          catches.push({
            hookIndex: h,
            baitId,
            outcome: 'junk',
            junkName,
            junkIcon,
            junkValue: junkVal,
            junkExp,
            junkWeight: junkW,
          });
        }
        // 2. Срыв рыбы (5% шанс: 0.03 .. 0.08)
        else if (roll < 0.08) {
          catches.push({
            hookIndex: h,
            baitId,
            outcome: 'escaped',
            escapeReason: 'Рыба сорвала наживку и ушла на глубину!',
          });
        }
        // 3. Улов рыбы (92% шанс: 0.08 .. 1.00)
        else {
          // Generate fish with current feeder's effective parameters
          const generated = getRandomFish(
            remainingStrength, // rodStrengthKg
            remainingStrength, // lineTensileKg
            baitId,
            locationId,
            1.0, // _locationWeightModifier
            env.timeOfDay,
            env.weather,
            playerLevel,
            feeder.strengthLevel, // rodLevel
            journal
          );

          // Weight budget check: if fish is heavier than remaining feeder strength, it escapes
          if (generated.weight > remainingStrength) {
            catches.push({
              hookIndex: h,
              baitId,
              outcome: 'escaped',
              escapeReason: `Рыба слишком крупная (${generated.weight.toFixed(2)} кг) — сорвалась!`,
            });
          } else {
            catches.push({
              hookIndex: h,
              baitId,
              outcome: 'caught',
              fish: generated,
            });
            remainingStrength = Math.max(0.1, remainingStrength - generated.weight);
          }
        }
      }

      return catches;
    },
    [playerLevel, journal]
  );

  // Check on mount and visibility change if any cast feeder is ready
  const checkCatches = useCallback(() => {
    const now = Date.now();
    const storedLastActive = Number(localStorage.getItem('fg_feeder_last_active')) || now;
    const offlineDuration = Math.max(0, now - storedLastActive);

    setFeeders((prevFeeders) => {
      let changed = false;
      const next = prevFeeders.map((f) => {
        // If not cast or already has pendingCatches, nothing to evaluate
        if (!f.isCast || f.pendingCatches) return f;

        const castTime = f.castTimestamp || now;
        const timeSinceCast = Math.max(0, now - castTime);

        // Check offline requirement:
        // Must be in water for at least OFFLINE_MS_REQUIRED AND player must have had an offline absence of OFFLINE_MS_REQUIRED
        const isReady = timeSinceCast >= OFFLINE_MS_REQUIRED && offlineDuration >= OFFLINE_MS_REQUIRED;

        if (isReady) {
          changed = true;
          const catches = generateCatchesForFeeder(f);
          return {
            ...f,
            pendingCatches: catches,
          };
        }
        return f;
      });

      return changed ? next : prevFeeders;
    });
  }, [generateCatchesForFeeder]);

  useEffect(() => {
    checkCatches();
    const timer = setInterval(checkCatches, 15000);
    return () => clearInterval(timer);
  }, [checkCatches]);

  // Actions:
  // 1. Buy Feeder slot
  const buyFeeder = useCallback(
    (slotIndex: number): boolean => {
      const config = FEEDER_SLOTS_CONFIG[slotIndex];
      if (!config) return false;
      if (playerLevel < config.levelReq) {
        triggerHaptic?.('notification');
        return false;
      }
      if (coins < config.cost) {
        triggerHaptic?.('notification');
        return false;
      }
      if (spendCoins && !spendCoins(config.cost)) {
        triggerHaptic?.('notification');
        return false;
      }

      setFeeders((prev) =>
        prev.map((f, idx) => (idx === slotIndex ? { ...f, isUnlocked: true } : f))
      );
      triggerHaptic?.('impact');
      return true;
    },
    [playerLevel, coins, spendCoins, triggerHaptic]
  );

  // 2. Upgrade Feeder strength
  const upgradeStrength = useCallback(
    (slotIndex: number): boolean => {
      const feeder = feedersRef.current[slotIndex];
      if (!feeder || !feeder.isUnlocked) return false;
      if (feeder.strengthLevel >= FEEDER_STRENGTH_TIERS.length) return false;

      const nextTier = FEEDER_STRENGTH_TIERS[feeder.strengthLevel];
      if (!nextTier) return false;

      if (coins < nextTier.cost) {
        triggerHaptic?.('notification');
        return false;
      }
      if (spendCoins && !spendCoins(nextTier.cost)) {
        triggerHaptic?.('notification');
        return false;
      }

      setFeeders((prev) =>
        prev.map((f, idx) =>
          idx === slotIndex ? { ...f, strengthLevel: f.strengthLevel + 1 } : f
        )
      );
      triggerHaptic?.('impact');
      return true;
    },
    [coins, spendCoins, triggerHaptic]
  );

  // 3. Unlock Hook 2 (Level 5+, 5000 coins) or Hook 3 (75 gems)
  const unlockHook = useCallback(
    (slotIndex: number, hookNumber: 2 | 3): boolean => {
      const feeder = feedersRef.current[slotIndex];
      if (!feeder || !feeder.isUnlocked) return false;
      if (feeder.unlockedHooks >= hookNumber) return false; // already unlocked

      if (hookNumber === 2) {
        if (playerLevel < 5) {
          triggerHaptic?.('notification');
          return false;
        }
        const cost = 5000;
        if (coins < cost) {
          triggerHaptic?.('notification');
          return false;
        }
        if (spendCoins && !spendCoins(cost)) {
          triggerHaptic?.('notification');
          return false;
        }
      } else if (hookNumber === 3) {
        const cost = 75;
        if (gems < cost) {
          triggerHaptic?.('notification');
          return false;
        }
        if (spendGems && !spendGems(cost)) {
          triggerHaptic?.('notification');
          return false;
        }
      }

      setFeeders((prev) =>
        prev.map((f, idx) =>
          idx === slotIndex ? { ...f, unlockedHooks: hookNumber } : f
        )
      );
      triggerHaptic?.('impact');
      return true;
    },
    [playerLevel, coins, gems, spendCoins, spendGems, triggerHaptic]
  );

  // 4. Set bait on a hook
  const setHookBait = useCallback(
    (slotIndex: number, hookIdx: number, baitId: string | null) => {
      setFeeders((prev) =>
        prev.map((f, idx) => {
          if (idx !== slotIndex) return f;
          const nextBaits = [...f.hookBaits];
          nextBaits[hookIdx] = baitId;
          return { ...f, hookBaits: nextBaits };
        })
      );
      triggerHaptic?.('selection');
    },
    [triggerHaptic]
  );

  // 5. Cast Feeder into water
  const castFeeder = useCallback(
    (slotIndex: number, locationId: string): boolean => {
      const feeder = feedersRef.current[slotIndex];
      if (!feeder || !feeder.isUnlocked || feeder.isCast) return false;

      // Check how many hooks are baited
      const baitedCount = feeder.hookBaits
        .slice(0, feeder.unlockedHooks)
        .filter(Boolean).length;
      if (baitedCount === 0) {
        triggerHaptic?.('notification');
        return false;
      }

      // Consume baits from player inventory
      if (consumeBait) {
        for (let i = 0; i < feeder.unlockedHooks; i++) {
          const bId = feeder.hookBaits[i];
          if (bId) {
            const ok = consumeBait(bId);
            if (!ok) {
              triggerHaptic?.('notification');
              return false;
            }
          }
        }
      }

      const now = Date.now();
      setFeeders((prev) =>
        prev.map((f, idx) =>
          idx === slotIndex
            ? {
                ...f,
                isCast: true,
                castTimestamp: now,
                castLocationId: locationId,
                pendingCatches: null,
              }
            : f
        )
      );

      // Record active timestamp
      localStorage.setItem('fg_feeder_last_active', now.toString());
      setLastActiveTs(now);

      triggerHaptic?.('impact');
      return true;
    },
    [consumeBait, triggerHaptic]
  );

  // 6. Cancel cast / retrieve before catch
  const cancelCast = useCallback(
    (slotIndex: number) => {
      setFeeders((prev) =>
        prev.map((f, idx) =>
          idx === slotIndex
            ? {
                ...f,
                isCast: false,
                castTimestamp: null,
                pendingCatches: null,
              }
            : f
        )
      );
      triggerHaptic?.('selection');
    },
    [triggerHaptic]
  );

  // 7. Collect catches (put in keepnet or sell directly)
  const collectCatches = useCallback(
    (
      slotIndex: number,
      directSell: boolean = false
    ): { success: boolean; coinsGained: number; expGained: number; fishCount: number } => {
      const feeder = feedersRef.current[slotIndex];
      if (!feeder || !feeder.pendingCatches) {
        return { success: false, coinsGained: 0, expGained: 0, fishCount: 0 };
      }

      let totalCoins = 0;
      let totalExp = 0;
      let fishCount = 0;

      feeder.pendingCatches.forEach((item) => {
        if (item.outcome === 'caught' && item.fish) {
          totalCoins += item.fish.price;
          totalExp += item.fish.exp;
          fishCount++;
          handleCatchForTournament(item.fish.weight, item.fish.fish.name);

          if (!directSell && addCaughtFish) {
            const caughtItem: CaughtFishItem = {
              uid: `feeder_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              fish: item.fish.fish,
              weight: item.fish.weight,
              price: item.fish.price,
              exp: item.fish.exp,
              caughtAt: Date.now(),
              sizeCategory: item.fish.sizeCategory,
            };
            addCaughtFish(caughtItem, item.fish.exp);
          }
        } else if (item.outcome === 'junk') {
          totalCoins += item.junkValue || 3;
          totalExp += item.junkExp || 3;
        }
      });

      if (directSell && totalCoins > 0 && addCoins) {
        addCoins(totalCoins);
      }

      // Reset slot cast state and hooks
      setFeeders((prev) =>
        prev.map((f, idx) =>
          idx === slotIndex
            ? {
                ...f,
                isCast: false,
                castTimestamp: null,
                pendingCatches: null,
                hookBaits: [null, null, null],
              }
            : f
        )
      );

      triggerHaptic?.('impact');
      return { success: true, coinsGained: totalCoins, expGained: totalExp, fishCount };
    },
    [addCaughtFish, addCoins, triggerHaptic]
  );

  // Check if any feeder has pending catches ready to claim
  const readyFeeders = feeders.filter((f) => Boolean(f.pendingCatches && f.pendingCatches.length > 0));
  const hasCatchesReady = readyFeeders.length > 0;

  // Active cast feeders count
  const activeCastCount = feeders.filter((f) => f.isCast && !f.pendingCatches).length;

  return {
    feeders,
    FEEDER_SLOTS_CONFIG,
    FEEDER_STRENGTH_TIERS,
    OFFLINE_MINUTES_REQUIRED,
    buyFeeder,
    upgradeStrength,
    unlockHook,
    setHookBait,
    castFeeder,
    cancelCast,
    collectCatches,
    hasCatchesReady,
    readyFeeders,
    activeCastCount,
    checkCatches,
  };
}
