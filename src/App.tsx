import { useEffect, useState, useRef } from 'react';
import { getRandomFish } from './fishData';
import {
  ROD_TIERS,
  REEL_TIERS,
  LINE_TIERS,
  INITIAL_PLAYER_GEAR,
  getRodStrength,
  getReelPullSpeed,
  getRodUpgradeCost,
  getReelUpgradeCost,
  type PlayerGearState,
  type RodTier,
  type ReelTier,
  type LineTier,
} from './gearData';
import { INITIAL_BAIT_INVENTORY } from './baitData';
import { LOCATIONS, DEFAULT_LOCATION_ID, type FishingLocation } from './locationsData';
import { Header } from './components/Header';
import { Navigation, type ActiveTab } from './components/Navigation';
import { FishingScreen, type GameState } from './components/FishingScreen';
import { InventoryScreen, type CaughtFishItem } from './components/InventoryScreen';
import { ShopScreen, type UpgradesState } from './components/ShopScreen';
import { MapScreen } from './components/MapScreen';
import { HomeScreen } from './components/HomeScreen';

interface ActiveFishState extends CaughtFishItem {
  rodBrokenRisk?: boolean;
}

const DEFAULT_UPGRADES: UpgradesState = {
  baitCapacityLevel: 0,
  hookSharpenLevel: 0,
  reelOilLevel: 0,
};

const BAIT_CAPACITY_MAP = [10, 20, 30, 50];
const WORM_REGEN_INTERVAL_MS = 60 * 60 * 1000;

export default function App() {
  const [userName, setUserName] = useState<string>('Рыбак');
  const [coins, setCoins] = useState<number>(() => Number(localStorage.getItem('fg_coins')) || 0);
  const [exp, setExp] = useState<number>(() => Number(localStorage.getItem('fg_exp')) || 0);
  const [level, setLevel] = useState<number>(() => Number(localStorage.getItem('fg_level')) || 1);
  const [inventory, setInventory] = useState<CaughtFishItem[]>(() => {
    const saved = localStorage.getItem('fg_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  // Новая модульная система снаряжения (Удилища, Катушки, Лески)
  const [gear, setGear] = useState<PlayerGearState>(() => {
    const saved = localStorage.getItem('fg_gear');
    return saved ? JSON.parse(saved) : INITIAL_PLAYER_GEAR;
  });

  const [baits, setBaits] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('fg_baits');
    return saved ? JSON.parse(saved) : INITIAL_BAIT_INVENTORY;
  });
  const [selectedBaitId, setSelectedBaitId] = useState<string>('worm');

  const [upgrades, setUpgrades] = useState<UpgradesState>(() => {
    const saved = localStorage.getItem('fg_upgrades');
    return saved ? JSON.parse(saved) : DEFAULT_UPGRADES;
  });

  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    () => localStorage.getItem('fg_selected_location') || DEFAULT_LOCATION_ID
  );
  const [isAtPond, setIsAtPond] = useState<boolean>(false);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('fishing');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentFish, setCurrentFish] = useState<ActiveFishState | null>(null);
  const [canDismissModal, setCanDismissModal] = useState<boolean>(false);

  const [tension, setTension] = useState<number>(50);
  const [catchProgress, setCatchProgress] = useState<number>(0);
  const isPullingRef = useRef<boolean>(false);

  const currentLocation: FishingLocation =
    LOCATIONS.find((l) => l.id === selectedLocationId) || LOCATIONS[0];

  const currentRod: RodTier =
    ROD_TIERS.find((r) => r.id === gear.equippedRodId) || ROD_TIERS[0];
  const rodLevel = gear.rodLevels[gear.equippedRodId] || 1;
  const currentRodStrength = getRodStrength(currentRod, rodLevel);

  const currentReel: ReelTier | null = gear.equippedReelId
    ? REEL_TIERS.find((r) => r.id === gear.equippedReelId) || null
    : null;
  const reelLevel = currentReel ? gear.reelLevels[currentReel.id] || 1 : 1;
  const reelPullSpeed = currentReel ? getReelPullSpeed(currentReel, reelLevel) : 1.0;

  const currentLine: LineTier =
    LINE_TIERS.find((l) => l.id === gear.equippedLineId) || LINE_TIERS[0];

  const currentBaitCapacity = BAIT_CAPACITY_MAP[upgrades.baitCapacityLevel] || 10;
  const expToNextLevel = level * 100;

  // Черви: пассивный доход раз в час
  useEffect(() => {
    const now = Date.now();
    const lastRegenTime = Number(localStorage.getItem('fg_last_worm_time')) || now;
    const diffMs = now - lastRegenTime;

    if (diffMs >= WORM_REGEN_INTERVAL_MS) {
      const generatedWorms = Math.floor(diffMs / WORM_REGEN_INTERVAL_MS);
      const remainingMs = diffMs % WORM_REGEN_INTERVAL_MS;

      setBaits((prev) => {
        const currentWorms = prev.worm || 0;
        const newWorms = Math.min(currentBaitCapacity, currentWorms + generatedWorms);
        return { ...prev, worm: newWorms };
      });

      localStorage.setItem('fg_last_worm_time', (now - remainingMs).toString());
    } else if (!localStorage.getItem('fg_last_worm_time')) {
      localStorage.setItem('fg_last_worm_time', now.toString());
    }

    const interval = setInterval(() => {
      const checkNow = Date.now();
      const lastCheck = Number(localStorage.getItem('fg_last_worm_time')) || checkNow;
      if (checkNow - lastCheck >= WORM_REGEN_INTERVAL_MS) {
        setBaits((prev) => {
          const currentWorms = prev.worm || 0;
          if (currentWorms < currentBaitCapacity) {
            return { ...prev, worm: currentWorms + 1 };
          }
          return prev;
        });
        localStorage.setItem('fg_last_worm_time', checkNow.toString());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentBaitCapacity]);

  // Синхронизация localStorage
  useEffect(() => { localStorage.setItem('fg_coins', coins.toString()); }, [coins]);
  useEffect(() => { localStorage.setItem('fg_exp', exp.toString()); }, [exp]);
  useEffect(() => { localStorage.setItem('fg_level', level.toString()); }, [level]);
  useEffect(() => { localStorage.setItem('fg_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('fg_baits', JSON.stringify(baits)); }, [baits]);
  useEffect(() => { localStorage.setItem('fg_upgrades', JSON.stringify(upgrades)); }, [upgrades]);
  useEffect(() => { localStorage.setItem('fg_gear', JSON.stringify(gear)); }, [gear]);
  useEffect(() => { localStorage.setItem('fg_selected_location', selectedLocationId); }, [selectedLocationId]);

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

  const triggerHaptic = (type: 'impact' | 'notification' | 'selection') => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      if (type === 'impact') tg.HapticFeedback.impactOccurred('medium');
      if (type === 'notification') tg.HapticFeedback.notificationOccurred('success');
      if (type === 'selection') tg.HapticFeedback.selectionChanged();
    }
  };

  const baseZoneWidth = 35 + upgrades.hookSharpenLevel * 5;
  const sweetSpotStart = Math.max(10, 50 - baseZoneWidth / 2);
  const sweetSpotEnd = Math.min(90, 50 + baseZoneWidth / 2);

  const startFishing = () => {
    const availableBait = baits[selectedBaitId] || 0;
    if (availableBait <= 0) return;

    setBaits((prev) => ({
      ...prev,
      [selectedBaitId]: Math.max(0, (prev[selectedBaitId] || 0) - 1),
    }));

    setGameState('waiting');
    triggerHaptic('selection');

    setTimeout(() => {
      const generated = getRandomFish(
        currentRodStrength,
        currentLine.maxTensileKg,
        selectedBaitId,
        currentLocation.weightModifier
      );

      setCurrentFish({
        ...generated,
        price: generated.price,
        uid: Math.random().toString(36).substring(2, 9),
        caughtAt: Date.now(),
      });
      setGameState('hooked');
      triggerHaptic('notification');
    }, Math.random() * 2500 + 2000);
  };

  const startReeling = () => {
    setGameState('reeling');
    setTension(50);
    setCatchProgress(15);
    triggerHaptic('impact');
  };

  useEffect(() => {
    if (gameState !== 'reeling') return;
    let localTension = tension;
    let localProgress = catchProgress;

    const isOverweight = currentFish?.rodBrokenRisk;
    // Множитель скорости смотки зависит от установленной катушки и апгрейда смазки
    const speedMultiplier = reelPullSpeed * (1 + upgrades.reelOilLevel * 0.12);

    const interval = setInterval(() => {
      const pullRate = isPullingRef.current ? (isOverweight ? 4.6 : 2.5) : (isOverweight ? -3.6 : -1.8);
      localTension += pullRate;

      const randomJerk = (Math.random() - 0.5) * (isOverweight ? 26 : 12);
      if (Math.random() < (isOverweight ? 0.25 : 0.1)) localTension += randomJerk;

      const inSweetSpot = localTension >= sweetSpotStart && localTension <= sweetSpotEnd;
      const baseProgressGain = (isOverweight ? 0.5 : 1.0) * speedMultiplier;
      localProgress += inSweetSpot ? baseProgressGain : (isOverweight ? -1.2 : -0.6);

      if (localTension >= 100 || localTension <= 0 || localProgress <= 0) {
        clearInterval(interval);
        setGameState('lost');
        setCanDismissModal(false);
        setTimeout(() => setCanDismissModal(true), 1200);
        (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
        return;
      }

      if (localProgress >= 100) {
        clearInterval(interval);
        if (currentFish) {
          const { rodBrokenRisk: _risk, ...cleanFish } = currentFish;
          setInventory((prev) => [cleanFish, ...prev]);

          setExp((prev) => {
            const nextExp = prev + currentFish.exp;
            if (nextExp >= expToNextLevel) {
              setLevel((lvl) => lvl + 1);
              return nextExp - expToNextLevel;
            }
            return nextExp;
          });
        }
        setGameState('caught');
        setCanDismissModal(false);
        setTimeout(() => setCanDismissModal(true), 1500);
        triggerHaptic('notification');
        return;
      }

      setTension(Math.max(0, Math.min(100, localTension)));
      setCatchProgress(Math.max(0, Math.min(100, localProgress)));
    }, 40);

    return () => clearInterval(interval);
  }, [gameState, currentFish, level, expToNextLevel, sweetSpotStart, sweetSpotEnd, reelPullSpeed, upgrades.reelOilLevel]);

  // Обработчики магазина снастей
  const handleBuyRod = (rod: RodTier) => {
    if (coins < rod.basePrice || level < rod.levelReq) return;
    setCoins((c) => c - rod.basePrice);
    setGear((prev) => ({
      ...prev,
      ownedRods: [...prev.ownedRods, rod.id],
      rodLevels: { ...prev.rodLevels, [rod.id]: 1 },
      equippedRodId: rod.id,
      // Если удилище без катушкодержателя (камыш) — снимаем катушку
      equippedReelId: rod.canMountReel ? prev.equippedReelId : null,
    }));
    triggerHaptic('notification');
  };

  const handleUpgradeRod = (rod: RodTier) => {
    const currentLvl = gear.rodLevels[rod.id] || 1;
    if (currentLvl >= 5) return;
    const cost = getRodUpgradeCost(rod, currentLvl + 1);
    if (coins < cost) return;

    setCoins((c) => c - cost);
    setGear((prev) => ({
      ...prev,
      rodLevels: { ...prev.rodLevels, [rod.id]: currentLvl + 1 },
    }));
    triggerHaptic('notification');
  };

  const handleEquipRod = (rodId: string) => {
    const rod = ROD_TIERS.find((r) => r.id === rodId);
    setGear((prev) => ({
      ...prev,
      equippedRodId: rodId,
      equippedReelId: rod?.canMountReel ? prev.equippedReelId : null,
    }));
    triggerHaptic('selection');
  };

  const handleBuyReel = (reel: ReelTier) => {
    if (coins < reel.basePrice || level < reel.levelReq) return;
    setCoins((c) => c - reel.basePrice);
    setGear((prev) => ({
      ...prev,
      ownedReels: [...prev.ownedReels, reel.id],
      reelLevels: { ...prev.reelLevels, [reel.id]: 1 },
      equippedReelId: currentRod.canMountReel ? reel.id : prev.equippedReelId,
    }));
    triggerHaptic('notification');
  };

  const handleUpgradeReel = (reel: ReelTier) => {
    const currentLvl = gear.reelLevels[reel.id] || 1;
    if (currentLvl >= 3) return;
    const cost = getReelUpgradeCost(reel, currentLvl + 1);
    if (coins < cost) return;

    setCoins((c) => c - cost);
    setGear((prev) => ({
      ...prev,
      reelLevels: { ...prev.reelLevels, [reel.id]: currentLvl + 1 },
    }));
    triggerHaptic('notification');
  };

  const handleEquipReel = (reelId: string | null) => {
    if (reelId && !currentRod.canMountReel) return;
    setGear((prev) => ({ ...prev, equippedReelId: reelId }));
    triggerHaptic('selection');
  };

  const handleBuyLine = (line: LineTier) => {
    if (coins < line.price || level < line.levelReq) return;
    setCoins((c) => c - line.price);
    setGear((prev) => ({
      ...prev,
      lineStock: { ...prev.lineStock, [line.id]: (prev.lineStock[line.id] || 0) + 1 },
      equippedLineId: prev.equippedLineId || line.id,
    }));
    triggerHaptic('impact');
  };

  const handleEquipLine = (lineId: string) => {
    setGear((prev) => ({ ...prev, equippedLineId: lineId }));
    triggerHaptic('selection');
  };

  const handleBuyBait = (baitId: string, amount: number, totalCost: number) => {
    if (coins < totalCost) return;
    const currentCount = baits[baitId] || 0;
    if (currentCount + amount > currentBaitCapacity) return;

    setCoins((c) => c - totalCost);
    setBaits((prev) => ({
      ...prev,
      [baitId]: (prev[baitId] || 0) + amount,
    }));
    triggerHaptic('impact');
  };

  const handleBuyUpgrade = (type: keyof UpgradesState, cost: number) => {
    if (coins < cost) return;
    setCoins((c) => c - cost);
    setUpgrades((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
    triggerHaptic('notification');
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return { text: 'ЛЕГЕНДАРНАЯ', color: '#fbbf24' };
      case 'epic': return { text: 'ЭПИЧЕСКАЯ', color: '#c084fc' };
      case 'rare': return { text: 'РЕДКАЯ', color: '#60a5fa' };
      default: return { text: 'ОБЫЧНАЯ', color: '#94a3b8' };
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px 16px 8px 16px',
        justifyContent: 'space-between',
        background: isAtPond ? currentLocation.gradient : 'linear-gradient(180deg, #091325 0%, #0d2744 60%, #06192d 100%)',
        userSelect: 'none',
        transition: 'background 0.5s ease',
      }}
    >
      <Header
        userName={userName}
        level={level}
        coins={coins}
        exp={exp}
        maxExp={expToNextLevel}
        rodName={`${currentRod.name} [${rodLevel} ур.]`}
        rodIcon={currentRod.icon}
      />

      {isMapOpen && (
        <MapScreen
          playerLevel={level}
          currentLocationId={selectedLocationId}
          onSelectLocation={(loc) => {
            setSelectedLocationId(loc.id);
            triggerHaptic('selection');
          }}
          onGoFishing={() => {
            setIsMapOpen(false);
            setIsAtPond(true);
            setActiveTab('fishing');
            triggerHaptic('notification');
          }}
        />
      )}

      {!isMapOpen && activeTab === 'fishing' && (
        isAtPond ? (
          <FishingScreen
            gameState={gameState}
            tension={tension}
            catchProgress={catchProgress}
            sweetSpotStart={sweetSpotStart}
            sweetSpotEnd={sweetSpotEnd}
            currentFish={currentFish}
            canDismissModal={canDismissModal}
            selectedBaitId={selectedBaitId}
            baits={baits}
            currentLocation={currentLocation}
            onBackToHub={() => {
              setIsAtPond(false);
              triggerHaptic('selection');
            }}
            onOpenMap={() => {
              setIsMapOpen(true);
              triggerHaptic('selection');
            }}
            onSelectBait={(id) => {
              setSelectedBaitId(id);
              triggerHaptic('selection');
            }}
            getRarityLabel={getRarityLabel}
            onStartFishing={startFishing}
            onStartReeling={startReeling}
            onPullStart={() => { isPullingRef.current = true; }}
            onPullEnd={() => { isPullingRef.current = false; }}
            onDismissModal={() => { if (canDismissModal) setGameState('idle'); }}
          />
        ) : (
          <HomeScreen
            currentLocation={currentLocation}
            gear={gear}
            inventoryCount={inventory.length}
            onGoFishing={() => {
              setIsAtPond(true);
              triggerHaptic('notification');
            }}
            onOpenMap={() => {
              setIsMapOpen(true);
              triggerHaptic('selection');
            }}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              triggerHaptic('selection');
            }}
          />
        )
      )}

      {!isMapOpen && activeTab === 'inventory' && (
        <InventoryScreen
          inventory={inventory}
          getRarityLabel={getRarityLabel}
          onSellFish={(uid, price) => {
            setCoins((c) => c + price);
            setInventory((inv) => inv.filter((item) => item.uid !== uid));
            triggerHaptic('impact');
          }}
          onSellAll={() => {
            const total = inventory.reduce((sum, item) => sum + item.price, 0);
            setCoins((c) => c + total);
            setInventory([]);
            triggerHaptic('notification');
          }}
        />
      )}

      {!isMapOpen && activeTab === 'shop' && (
        <ShopScreen
          coins={coins}
          level={level}
          gear={gear}
          baits={baits}
          baitCapacity={currentBaitCapacity}
          upgrades={upgrades}
          onBuyRod={handleBuyRod}
          onUpgradeRod={handleUpgradeRod}
          onEquipRod={handleEquipRod}
          onBuyReel={handleBuyReel}
          onUpgradeReel={handleUpgradeReel}
          onEquipReel={handleEquipReel}
          onBuyLine={handleBuyLine}
          onEquipLine={handleEquipLine}
          onBuyBait={handleBuyBait}
          onBuyUpgrade={handleBuyUpgrade}
        />
      )}

      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMapOpen(false);
          triggerHaptic('selection');
        }}
        inventoryCount={inventory.length}
      />
    </div>
  );
}