import { useState, useEffect } from 'react';
import { LOCATIONS, DEFAULT_LOCATION_ID, type FishingLocation } from './locationsData';
import { Header } from './components/Header';
import { Navigation, type ActiveTab } from './components/Navigation';
import { FishingScreen } from './components/FishingScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { ShopScreen } from './components/ShopScreen';
import { MapScreen } from './components/MapScreen';
import { HomeScreen } from './components/HomeScreen';

import { usePlayerState } from './hooks/usePlayerState';
import { useGearState } from './hooks/useGearState';
import { useBaitState } from './hooks/useBaitState';
import { useFishingSimulation } from './hooks/useFishingSimulation';

export default function App() {
  // Виброотклик Telegram WebApp
  const triggerHaptic = (type: 'impact' | 'notification' | 'selection') => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      if (type === 'impact') tg.HapticFeedback.impactOccurred('medium');
      if (type === 'notification') tg.HapticFeedback.notificationOccurred('success');
      if (type === 'selection') tg.HapticFeedback.selectionChanged();
    }
  };

  // 1. Состояние игрока и экономики
  const player = usePlayerState();

  // 2. Снаряжение (удочки, катушки, лески)
  const gear = useGearState(player.coins, player.level, player.spendCoins, triggerHaptic);

  // 3. Наживки и мастерская
  const baits = useBaitState(player.coins, player.spendCoins, triggerHaptic);

  // Состояние навигации и локации
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    () => localStorage.getItem('fg_selected_location') || DEFAULT_LOCATION_ID
  );
  const [isAtPond, setIsAtPond] = useState<boolean>(false);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('fishing');

  const currentLocation: FishingLocation =
    LOCATIONS.find((l) => l.id === selectedLocationId) || LOCATIONS[0];

  useEffect(() => {
    localStorage.setItem('fg_selected_location', selectedLocationId);
  }, [selectedLocationId]);

  // 4. Физика рыбалки и игровой цикл
  const fishing = useFishingSimulation({
    currentRodStrength: gear.currentRodStrength,
    currentLineTensileKg: gear.currentLine.maxTensileKg,
    reelPullSpeed: gear.reelPullSpeed,
    hookSharpenLevel: baits.upgrades.hookSharpenLevel,
    reelOilLevel: baits.upgrades.reelOilLevel,
    selectedBaitId: baits.selectedBaitId,
    baits: baits.baits,
    currentLocation,
    consumeBait: baits.consumeBait,
    onFishCaught: player.addCaughtFish,
    triggerHaptic,
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
        padding: '16px 16px 8px 16px',
        justifyContent: 'space-between',
        background: isAtPond ? currentLocation.gradient : 'linear-gradient(180deg, #091325 0%, #0d2744 60%, #06192d 100%)',
        userSelect: 'none',
        transition: 'background 0.5s ease',
      }}
    >
      <Header
        userName={player.userName}
        level={player.level}
        coins={player.coins}
        exp={player.exp}
        maxExp={player.expToNextLevel}
        rodName={`${gear.currentRod.name} [${gear.rodLevel} ур.]`}
        rodIcon={gear.currentRod.icon}
      />

      {isMapOpen && (
        <MapScreen
          playerLevel={player.level}
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
            gameState={fishing.gameState}
            tension={fishing.tension}
            catchProgress={fishing.catchProgress}
            sweetSpotStart={fishing.sweetSpotStart}
            sweetSpotEnd={fishing.sweetSpotEnd}
            currentFish={fishing.currentFish}
            canDismissModal={fishing.canDismissModal}
            selectedBaitId={baits.selectedBaitId}
            baits={baits.baits}
            currentLocation={currentLocation}
            onBackToHub={() => {
              fishing.resetToIdle();
              setIsAtPond(false);
              triggerHaptic('selection');
            }}
            onOpenMap={() => {
              fishing.resetToIdle();
              setIsMapOpen(true);
              triggerHaptic('selection');
            }}
            onSelectBait={baits.selectBait}
            getRarityLabel={getRarityLabel}
            onStartFishing={fishing.startFishing}
            onStartReeling={fishing.startReeling}
            onPullStart={fishing.handlePullStart}
            onPullEnd={fishing.handlePullEnd}
            onDismissModal={fishing.dismissModal}
          />
        ) : (
          <HomeScreen
            currentLocation={currentLocation}
            gear={gear.gear}
            inventoryCount={player.inventoryCount}
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
          inventory={player.inventory}
          getRarityLabel={getRarityLabel}
          onSellFish={(uid, price) => {
            player.sellFish(uid, price);
            triggerHaptic('impact');
          }}
          onSellAll={() => {
            player.sellAllFish();
            triggerHaptic('notification');
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
        />
      )}

      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMapOpen(false);
          triggerHaptic('selection');
        }}
        inventoryCount={player.inventoryCount}
      />
    </div>
  );
}