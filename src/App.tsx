import { useState, useEffect } from 'react';
import { LOCATIONS, DEFAULT_LOCATION_ID, type FishingLocation } from './locationsData';
import { Header } from './components/Header';
import { Navigation, type ActiveTab } from './components/Navigation';
import { FishingScreen } from './components/FishingScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { ShopScreen } from './components/ShopScreen';
import { MapScreen } from './components/MapScreen';
import { HomeScreen } from './components/HomeScreen';
import { GearInventoryScreen } from './components/GearInventoryScreen';

import { usePlayerState } from './hooks/usePlayerState';
import { useGearState } from './hooks/useGearState';
import { useBaitState } from './hooks/useBaitState';
import { useFishingSimulation } from './hooks/useFishingSimulation';
import { useDailyQuests } from './hooks/useDailyQuests';
import { triggerHaptic as triggerHapticUtil } from './utils/haptics';

import { FISH_DATABASE } from './fishData';
import { initUserAnalytics, trackGoal } from './utils/analytics';

export default function App() {
  // Предварительная загрузка всех картинок рыб в кэш браузера при старте и инициализация аналитики
  useEffect(() => {
    initUserAnalytics();
    FISH_DATABASE.forEach((fish) => {
      if (fish.image) {
        const img = new Image();
        img.src = fish.image;
      }
    });
  }, []);
  // Виброотклик Telegram WebApp и браузера
  const triggerHaptic = (type: 'impact' | 'notification' | 'selection') => {
    triggerHapticUtil(type);
  };

  // 1. Состояние игрока и экономики
  const player = usePlayerState();

  // 2. Снаряжение (удочки, катушки, лески)
  const gear = useGearState(
    player.coins,
    player.level,
    player.spendCoins,
    player.gems,
    player.spendGems,
    triggerHaptic
  );

  // 3. Наживки и мастерская
  const baits = useBaitState(player.coins, player.spendCoins, triggerHaptic);

  // Состояние навигации и локации
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    () => localStorage.getItem('fg_selected_location') || DEFAULT_LOCATION_ID
  );
  const [isAtPond, setIsAtPond] = useState<boolean>(false);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('base');
  const [baseClickNonce, setBaseClickNonce] = useState<number>(0);

  const currentLocation: FishingLocation =
    LOCATIONS.find((l) => l.id === selectedLocationId) || LOCATIONS[0];

  useEffect(() => {
    localStorage.setItem('fg_selected_location', selectedLocationId);
  }, [selectedLocationId]);

  // 4. Задания Егеря (ежедневные квесты)
  const dailyQuests = useDailyQuests({
    onAddCoins: player.addCoins,
    onAddExp: player.addExp,
    onAddGems: (amount) => player.setGems((prev) => prev + amount),
    playerLevel: player.level,
  });

  // 5. Физика рыбалки и игровой цикл
  const fishing = useFishingSimulation({
    currentRodStrength: gear.currentRodStrength,
    currentLineTensileKg: gear.currentLineTensileKg,
    reelPullSpeed: gear.reelPullSpeed,
    hookSharpenLevel: baits.upgrades.hookSharpenLevel,
    reelOilLevel: baits.upgrades.reelOilLevel,
    selectedBaitId: baits.selectedBaitId,
    baits: baits.baits,
    currentLocation,
    consumeBait: baits.consumeBait,
    onFishCaught: (caughtItem, exp) => {
      player.addCaughtFish(caughtItem, exp);
      dailyQuests.handleFishCaught(caughtItem, baits.selectedBaitId);
      trackGoal('fish_caught', {
        fish: caughtItem.fish.name,
        weight: caughtItem.weight,
        rarity: caughtItem.fish.rarity,
        price: caughtItem.price,
      });
    },
    onLineBreak: () => {
      gear.breakLine();
      trackGoal('line_break');
    },
    triggerHaptic,
    isKeepnetFull: player.isKeepnetFull,
    spendEnergy: player.spendEnergy,
  });

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
        width: '100%',
        boxSizing: 'border-box',
        padding: !isAtPond && activeTab === 'base'
          ? '0 0 calc(6px + env(safe-area-inset-bottom, 0px)) 0'
          : 'max(96px, var(--tg-content-safe-area-inset-top, calc(env(safe-area-inset-top, 44px) + 52px))) 8px calc(6px + env(safe-area-inset-bottom, 0px)) 8px',
        justifyContent: 'space-between',
        background: isAtPond ? currentLocation.gradient : 'linear-gradient(180deg, #091325 0%, #0d2744 60%, #06192d 100%)',
        userSelect: 'none',
        transition: 'background 0.5s ease',
      }}
    >
      {(activeTab === 'keepnet' || activeTab === 'inventory' || activeTab === 'shop') && (
        <Header
          userName={player.userName}
          level={player.level}
          coins={player.coins}
          gems={player.gems}
          exp={player.exp}
          maxExp={player.expToNextLevel}
          energy={player.energy}
          maxEnergy={player.maxEnergy}
          rodName={`${gear.currentRod.name} [${gear.rodLevel} ур.]`}
          rodIcon={gear.currentRod.icon}
        />
      )}

      {(isMapOpen || activeTab === 'map') && (
        <MapScreen
          playerLevel={player.level}
          currentLocationId={selectedLocationId}
          onSelectLocation={(loc) => {
            setSelectedLocationId(loc.id);
            triggerHaptic('selection');
          }}
          onGoFishing={() => {
            if (player.isKeepnetFull) {
              setIsMapOpen(false);
              setActiveTab('keepnet');
              triggerHaptic('notification');
              return;
            }
            setIsMapOpen(false);
            setIsAtPond(true);
            setActiveTab('base');
            triggerHaptic('notification');
          }}
        />
      )}

      {!isMapOpen && activeTab === 'base' && (
        isAtPond ? (
          <FishingScreen
            gameState={fishing.gameState}
            tension={fishing.tension}
            catchProgress={fishing.catchProgress}
            sweetSpotStart={fishing.sweetSpotStart}
            sweetSpotEnd={fishing.sweetSpotEnd}
            currentFish={fishing.currentFish}
            canDismissModal={fishing.canDismissModal}
            selectedBaitId={baits.selectedBaitId}
            baits={baits.baits}
            playerLevel={player.level}
            hasLineOnRod={gear.hasLineOnRod}
            rodMaterial={gear.currentRod.material}
            coins={player.coins}
            gems={player.gems}
            currentLocation={currentLocation}
            inventoryCount={player.inventoryCount}
            maxKeepnetCapacity={player.maxKeepnetCapacity}
            energy={player.energy}
            maxEnergy={player.maxEnergy}
            secondsToNextEnergy={player.secondsToNextEnergy}
            dailyProvisions={player.dailyProvisions}
            onBuyProvision={player.buyProvision}
            onBuyEnergyWithGems={player.buyEnergyWithGems}
            onOpenKeepnet={() => {
              fishing.resetToIdle();
              setIsAtPond(false);
              setActiveTab('keepnet');
              triggerHaptic('selection');
            }}
            onBackToHub={() => {
              fishing.resetToIdle();
              setIsAtPond(false);
              setActiveTab('base');
              triggerHaptic('selection');
            }}
            onOpenMap={() => {
              fishing.resetToIdle();
              setActiveTab('map');
              triggerHaptic('selection');
            }}
            onOpenShop={() => {
              fishing.resetToIdle();
              setIsAtPond(false);
              setActiveTab('shop');
              triggerHaptic('selection');
            }}
            onSelectBait={baits.selectBait}
            getRarityLabel={getRarityLabel}
            onStartFishing={() => {
              fishing.startFishing();
              trackGoal('cast_rod', { location: currentLocation.name });
            }}
            onStartReeling={fishing.startReeling}
            onPullStart={fishing.handlePullStart}
            onPullEnd={fishing.handlePullEnd}
            onDismissModal={fishing.dismissModal}
          />
        ) : (
          <HomeScreen
            currentLocation={currentLocation}
            gear={gear.gear}
            userName={player.userName}
            level={player.level}
            exp={player.exp}
            maxExp={player.expToNextLevel}
            coins={player.coins}
            gems={player.gems}
            energy={player.energy}
            maxEnergy={player.maxEnergy}
            secondsToNextEnergy={player.secondsToNextEnergy}
            dailyProvisions={player.dailyProvisions}
            onBuyProvision={player.buyProvision}
            onBuyEnergyWithGems={player.buyEnergyWithGems}
            onAddTestGems={player.addGems}
            inventoryCount={player.inventoryCount}
            maxKeepnetCapacity={player.maxKeepnetCapacity}
            selectedBaitId={baits.selectedBaitId}
            baits={baits.baits}
            journal={player.journal}
            hasClaimedAllSpeciesReward={player.hasClaimedAllSpeciesReward}
            onClaimAllSpeciesReward={player.claimAllSpeciesReward}
            dailyQuests={dailyQuests.quests}
            allCompletedBonusClaimed={dailyQuests.allCompletedBonusClaimed}
            timeUntilMidnight={dailyQuests.timeUntilMidnight}
            questCompletedCount={dailyQuests.completedCount}
            questUnclaimedCount={dailyQuests.unclaimedCount}
            canClaimBonus={dailyQuests.canClaimBonus}
            onClaimQuestReward={dailyQuests.claimQuestReward}
            onClaimDailyBonus={dailyQuests.claimDailyBonus}
            resetModalSignal={baseClickNonce}
            onSelectBait={baits.selectBait}
            onEquipRod={gear.equipRod}
            onGoFishing={() => {
              if (player.isKeepnetFull) {
                setActiveTab('keepnet');
                triggerHaptic('notification');
                return;
              }
              setIsAtPond(true);
              triggerHaptic('notification');
            }}
            onOpenKeepnet={() => {
              setActiveTab('keepnet');
              triggerHaptic('selection');
            }}
            onOpenMap={() => {
              setActiveTab('map');
              triggerHaptic('selection');
            }}
            onOpenShop={() => {
              setActiveTab('shop');
              triggerHaptic('selection');
            }}
            onOpenInventory={() => {
              setActiveTab('inventory');
              triggerHaptic('selection');
            }}
          />
        )
      )}

      {!isMapOpen && activeTab === 'keepnet' && (
        <InventoryScreen
          inventory={player.inventory}
          maxCapacity={player.maxKeepnetCapacity}
          getRarityLabel={getRarityLabel}
          onSellFish={(uid, price) => {
            player.sellFish(uid, price);
            trackGoal('sell_single_fish', { price });
            triggerHaptic('impact');
          }}
          onSellAll={() => {
            player.sellAllFish();
            trackGoal('sell_all_fish');
            triggerHaptic('notification');
          }}
          onClose={() => {
            setActiveTab('base');
            triggerHaptic('selection');
          }}
        />
      )}

      {!isMapOpen && activeTab === 'shop' && (
        <ShopScreen
          coins={player.coins}
          level={player.level}
          gear={gear.gear}
          baits={baits.baits}
          baitCapacity={baits.currentBaitCapacity}
          upgrades={baits.upgrades}
          onBuyRod={gear.buyRod}
          onUpgradeRod={gear.upgradeRod}
          onEquipRod={gear.equipRod}
          onBuyReel={gear.buyReel}
          onUpgradeReel={gear.upgradeReel}
          onEquipReel={gear.equipReel}
          onBuyLine={gear.buyLine}
          onEquipLine={gear.equipLine}
          onBuyBait={baits.buyBait}
          onBuyUpgrade={baits.buyUpgrade}
          energy={player.energy}
          maxEnergy={player.maxEnergy}
          gems={player.gems}
          dailyProvisions={player.dailyProvisions}
          onBuyProvision={player.buyProvision}
          onBuyEnergyWithGems={player.buyEnergyWithGems}
        />
      )}

      {!isMapOpen && activeTab === 'inventory' && (
        <GearInventoryScreen
          gear={gear.gear}
          baits={baits.baits}
          selectedBaitId={baits.selectedBaitId}
          onEquipRod={gear.equipRod}
          onEquipReel={gear.equipReel}
          onEquipLine={gear.equipLine}
          onSelectBait={baits.selectBait}
          onOpenShop={() => {
            setActiveTab('shop');
            triggerHaptic('selection');
          }}
        />
      )}

      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setBaseClickNonce((prev) => prev + 1);
          if (tab === 'base') {
            if (isAtPond) {
              fishing.resetToIdle();
              setIsAtPond(false);
            }
            setActiveTab('base');
            setIsMapOpen(false);
          } else {
            if (isAtPond) {
              fishing.resetToIdle();
              setIsAtPond(false);
            }
            setActiveTab(tab);
            setIsMapOpen(tab === 'map');
          }
          triggerHaptic('selection');
        }}
        inventoryCount={player.inventoryCount}
      />
    </div>
  );
}