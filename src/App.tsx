import { useEffect, useState, useRef } from 'react';
import { getRandomFish } from './fishData';
import { RODS, type Rod } from './shopData';
import { INITIAL_BAIT_INVENTORY } from './baitData';
import { Header } from './components/Header';
import { Navigation, type ActiveTab } from './components/Navigation';
import { FishingScreen, type GameState } from './components/FishingScreen';
import { InventoryScreen, type CaughtFishItem } from './components/InventoryScreen';
import { ShopScreen, type UpgradesState } from './components/ShopScreen';

interface ActiveFishState extends CaughtFishItem {
  rodBrokenRisk?: boolean;
}

const DEFAULT_UPGRADES: UpgradesState = {
  baitCapacityLevel: 0,
  hookSharpenLevel: 0,
  reelOilLevel: 0,
};

const BAIT_CAPACITY_MAP = [10, 20, 30, 50];

export default function App() {
  const [userName, setUserName] = useState<string>('Рыбак');
  const [coins, setCoins] = useState<number>(() => Number(localStorage.getItem('fg_coins')) || 0);
  const [exp, setExp] = useState<number>(() => Number(localStorage.getItem('fg_exp')) || 0);
  const [level, setLevel] = useState<number>(() => Number(localStorage.getItem('fg_level')) || 1);
  const [inventory, setInventory] = useState<CaughtFishItem[]>(() => {
    const saved = localStorage.getItem('fg_inventory');
    return saved ? JSON.parse(saved) : [];
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

  const [equippedRodId, setEquippedRodId] = useState<string>(() => localStorage.getItem('fg_rod') || 'bamboo');
  const [ownedRods, setOwnedRods] = useState<string[]>(() => {
    const saved = localStorage.getItem('fg_owned_rods');
    return saved ? JSON.parse(saved) : ['bamboo'];
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('fishing');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentFish, setCurrentFish] = useState<ActiveFishState | null>(null);
  const [canDismissModal, setCanDismissModal] = useState<boolean>(false);

  const [tension, setTension] = useState<number>(50);
  const [catchProgress, setCatchProgress] = useState<number>(0);
  const isPullingRef = useRef<boolean>(false);

  const currentRod: Rod = RODS.find((r) => r.id === equippedRodId) || RODS[0];
  const rodIndex = RODS.findIndex((r) => r.id === equippedRodId);
  const playerRodLevel = rodIndex >= 0 ? rodIndex + 1 : 1;

  // Вместимость банки с учетом апгрейда
  const currentBaitCapacity = BAIT_CAPACITY_MAP[upgrades.baitCapacityLevel] || 10;

  // Опыт до следующего уровня
  const expToNextLevel = level * 100;

  // Автосохранение в localStorage
  useEffect(() => { localStorage.setItem('fg_coins', coins.toString()); }, [coins]);
  useEffect(() => { localStorage.setItem('fg_exp', exp.toString()); }, [exp]);
  useEffect(() => { localStorage.setItem('fg_level', level.toString()); }, [level]);
  useEffect(() => { localStorage.setItem('fg_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('fg_baits', JSON.stringify(baits)); }, [baits]);
  useEffect(() => { localStorage.setItem('fg_upgrades', JSON.stringify(upgrades)); }, [upgrades]);
  useEffect(() => { localStorage.setItem('fg_rod', equippedRodId); }, [equippedRodId]);
  useEffect(() => { localStorage.setItem('fg_owned_rods', JSON.stringify(ownedRods)); }, [ownedRods]);

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

  // Базовый размер зоны + бонус удочки + бонус от заточки крючков
  const baseZoneWidth = 35 + currentRod.sweetSpotBonus + upgrades.hookSharpenLevel * 5;
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
      const generated = getRandomFish(playerRodLevel, selectedBaitId);
      const finalPrice = Math.round(generated.price * currentRod.goldBonus);
      setCurrentFish({
        ...generated,
        price: finalPrice,
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

    // Множитель скорости смотки от смазки катушки
    const progressSpeedMultiplier = 1 + upgrades.reelOilLevel * 0.15;

    const interval = setInterval(() => {
      const pullRate = isPullingRef.current ? (isOverweight ? 4.5 : 2.4) : (isOverweight ? -3.5 : -1.8);
      localTension += pullRate;

      const randomJerk = (Math.random() - 0.5) * (isOverweight ? 25 : 12);
      if (Math.random() < (isOverweight ? 0.25 : 0.1)) localTension += randomJerk;

      const inSweetSpot = localTension >= sweetSpotStart && localTension <= sweetSpotEnd;
      const baseProgressGain = (isOverweight ? 0.5 : 1.0) * progressSpeedMultiplier;
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
  }, [gameState, currentFish, level, expToNextLevel, sweetSpotStart, sweetSpotEnd, upgrades.reelOilLevel]);

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
        background: 'linear-gradient(180deg, #091325 0%, #0d2744 60%, #06192d 100%)',
        userSelect: 'none',
      }}
    >
      <Header
        userName={userName}
        level={level}
        coins={coins}
        exp={exp}
        maxExp={expToNextLevel}
        rodName={currentRod.name}
        rodIcon={currentRod.icon}
      />

      {activeTab === 'fishing' && (
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
      )}

      {activeTab === 'inventory' && (
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

      {activeTab === 'shop' && (
        <ShopScreen
          coins={coins}
          level={level}
          equippedRodId={equippedRodId}
          ownedRods={ownedRods}
          baits={baits}
          baitCapacity={currentBaitCapacity}
          upgrades={upgrades}
          onBuyRod={(rod) => {
            if (coins >= rod.price && level >= rod.levelReq) {
              setCoins((c) => c - rod.price);
              setOwnedRods((r) => [...r, rod.id]);
              setEquippedRodId(rod.id);
              triggerHaptic('notification');
            }
          }}
          onEquipRod={(id) => {
            setEquippedRodId(id);
            triggerHaptic('selection');
          }}
          onBuyBait={handleBuyBait}
          onBuyUpgrade={handleBuyUpgrade}
        />
      )}

      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          triggerHaptic('selection');
        }}
        inventoryCount={inventory.length}
      />
    </div>
  );
}