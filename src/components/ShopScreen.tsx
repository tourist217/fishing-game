import React, { useState } from 'react';
import * as GearData from '../gearData';
import type { RodTier, ReelTier, LineTier } from '../gearData';
import { AVAILABLE_BAITS, type UpgradesState } from '../hooks/useBaitState';

interface GearState {
  ownedRods: string[];
  equippedRodId: string;
  ownedReels: string[];
  equippedReelId: string | null;
  ownedLines?: string[];
  equippedLineId: string | null;
  lineStock?: Record<string, number>;
  buyRod?: (item: RodTier) => boolean | void;
  buyReel?: (item: ReelTier) => boolean | void;
  buyLine?: (item: LineTier) => boolean | void;
  upgradeRod?: (item: RodTier) => boolean | void;
  upgradeReel?: (item: ReelTier) => boolean | void;
  equipRod?: (id: string) => void;
  equipReel?: (id: string | null) => void;
  equipLine?: (id: string) => void;
  gear?: GearData.PlayerGearState;
  rodLevel?: number;
  reelLevel?: number;
  rodLevels?: Record<string, number>;
  reelLevels?: Record<string, number>;
}

export interface ShopScreenProps {
  coins: number;
  level: number;
  gear: GearState;
  baits: Record<string, number>;
  baitCapacity: number;
  onBuyBait: (baitId: string, count: number, price: number) => boolean | void;
  upgrades: UpgradesState;
  onBuyUpgrade: (type: keyof UpgradesState, cost: number) => boolean | void;
  onBuyRod?: (rod: RodTier) => boolean | void;
  onUpgradeRod?: (rod: RodTier) => boolean | void;
  onEquipRod?: (id: string) => void;
  onBuyReel?: (reel: ReelTier) => boolean | void;
  onUpgradeReel?: (reel: ReelTier) => boolean | void;
  onEquipReel?: (id: string | null) => void;
  onBuyLine?: (line: LineTier) => boolean | void;
  onEquipLine?: (id: string) => void;
}

import { APP_VERSION } from '../version';

type ShopTab = 'rods' | 'reels' | 'lines' | 'baits' | 'upgrades';

export const ShopScreen: React.FC<ShopScreenProps> = (props) => {
  const {
    coins,
    level,
    gear,
    baits,
    baitCapacity,
    onBuyBait,
    upgrades,
    onBuyUpgrade,
    onBuyRod,
    onEquipRod,
    onBuyReel,
    onEquipReel,
    onBuyLine,
    onEquipLine,
  } = props;

  const [shopTab, setShopTab] = useState<ShopTab>('rods');

  // Берём списки снастей из gearData напрямую
  const rods: RodTier[] = GearData.ROD_TIERS || [];
  const reels: ReelTier[] = GearData.REEL_TIERS || [];
  const lines: LineTier[] = GearData.LINE_TIERS || [];

  // Достаем методы и состояния экипировки из gear
  const ownedRods: string[] = gear?.ownedRods || [];
  const equippedRodId: string = gear?.equippedRodId || '';
  const ownedReels: string[] = gear?.ownedReels || [];
  const equippedReelId: string = gear?.equippedReelId || '';
  const equippedLineId: string | null = gear?.equippedLineId || null;

  const handleBuyRod = (item: RodTier) => {
    if (onBuyRod) onBuyRod(item);
    else if (gear?.buyRod) gear.buyRod(item);
  };

  const handleEquipRod = (id: string) => {
    if (onEquipRod) onEquipRod(id);
    else if (gear?.equipRod) gear.equipRod(id);
  };

  const handleBuyReel = (item: ReelTier) => {
    if (onBuyReel) onBuyReel(item);
    else if (gear?.buyReel) gear.buyReel(item);
  };

  const handleEquipReel = (id: string) => {
    if (onEquipReel) onEquipReel(id);
    else if (gear?.equipReel) gear.equipReel(id);
  };

  const handleBuyLine = (item: LineTier) => {
    if (onBuyLine) onBuyLine(item);
    else if (gear?.buyLine) gear.buyLine(item);
  };

  const handleEquipLine = (id: string) => {
    if (onEquipLine) onEquipLine(id);
    else if (gear?.equipLine) gear.equipLine(id);
  };

  // Стоимость улучшений мастерской
  const getUpgradeCost = (currentLvl: number) => Math.round(50 * Math.pow(1.8, currentLvl));

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Шапка магазина */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '12px 16px',
          borderRadius: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Рыболовный магазин <span style={{ color: '#64748b', fontSize: '10px' }}>({APP_VERSION})</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>Товары и снасти</div>
        </div>
        <div
          style={{
            background: 'rgba(251, 191, 36, 0.15)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            borderRadius: '12px',
            padding: '6px 12px',
            color: '#fbbf24',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          {coins} 🪙
        </div>
      </div>

      {/* Вкладки магазина */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        {[
          { id: 'rods' as ShopTab, label: 'Удочки 🎣' },
          { id: 'reels' as ShopTab, label: 'Катушки ⚙️' },
          { id: 'lines' as ShopTab, label: 'Лески 🧵' },
          { id: 'baits' as ShopTab, label: 'Наживки 🪱' },
          { id: 'upgrades' as ShopTab, label: 'Мастерская 🛠️' },
        ].map((tab) => {
          const isActive = shopTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setShopTab(tab.id)}
              style={{
                flex: '0 0 auto',
                background: isActive ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 12px',
                color: isActive ? '#fff' : '#94a3b8',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Контент магазина */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          paddingRight: '4px',
        }}
      >
        {/* --- ВКЛАДКА 1: УДОЧКИ --- */}
        {shopTab === 'rods' &&
          rods.map((rod) => {
            const isOwned = ownedRods.includes(rod.id);
            const isEquipped = equippedRodId === rod.id;
            const price = (rod as any).basePrice ?? (rod as any).price ?? 50;
            const lvlReq = (rod as any).levelReq ?? (rod as any).minLevel ?? 1;
            const isLevelUnlocked = level >= lvlReq;
            const canAfford = coins >= price;
            const strength = (rod as any).maxFishWeightKg ?? (rod as any).strength ?? (rod as any).maxWeight ?? rod.maxStrengthKg;

            return (
              <div
                key={rod.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '14px',
                  padding: '12px',
                  border: isEquipped ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '24px' }}>🎣</span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{rod.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Прочность: <span style={{ color: '#38bdf8' }}>{strength} кг</span> • Ур. {lvlReq}
                      </div>
                    </div>
                  </div>
                  {!isOwned && (
                    <span style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '13px' }}>
                      {price} 🪙
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {!isOwned && (
                    <button
                      disabled={!canAfford || !isLevelUnlocked}
                      onClick={() => handleBuyRod(rod)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: canAfford && isLevelUnlocked ? '#2563eb' : '#334155',
                        color: canAfford && isLevelUnlocked ? '#fff' : '#64748b',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: canAfford && isLevelUnlocked ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {!isLevelUnlocked ? `Требуется ${lvlReq} ур. 🔒` : `Купить за ${price} 🪙`}
                    </button>
                  )}

                  {isOwned && !isEquipped && (
                    <button
                      onClick={() => handleEquipRod(rod.id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#334155',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Экипировать
                    </button>
                  )}

                  {isOwned && isEquipped && (
                    <div
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        textAlign: 'center',
                      }}
                    >
                      ✓ Экипировано
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {/* --- ВКЛАДКА 2: КАТУШКИ --- */}
        {shopTab === 'reels' &&
          reels.map((reel) => {
            const isOwned = ownedReels.includes(reel.id);
            const isEquipped = equippedReelId === reel.id;
            const price = (reel as any).basePrice ?? (reel as any).price ?? 50;
            const lvlReq = (reel as any).levelReq ?? (reel as any).minLevel ?? 1;
            const isLevelUnlocked = level >= lvlReq;
            const canAfford = coins >= price;
            const speed = (reel as any).pullSpeedMultiplier ?? (reel as any).speed ?? reel.maxPullSpeed;

            return (
              <div
                key={reel.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '14px',
                  padding: '12px',
                  border: isEquipped ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '24px' }}>⚙️</span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{reel.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Скорость подмотки: <span style={{ color: '#38bdf8' }}>x{Number(speed).toFixed(2)}</span> • Ур. {lvlReq}
                      </div>
                    </div>
                  </div>
                  {!isOwned && (
                    <span style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '13px' }}>
                      {price} 🪙
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {!isOwned && (
                    <button
                      disabled={!canAfford || !isLevelUnlocked}
                      onClick={() => handleBuyReel(reel)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: canAfford && isLevelUnlocked ? '#2563eb' : '#334155',
                        color: canAfford && isLevelUnlocked ? '#fff' : '#64748b',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: canAfford && isLevelUnlocked ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {!isLevelUnlocked ? `Требуется ${lvlReq} ур. 🔒` : `Купить за ${price} 🪙`}
                    </button>
                  )}

                  {isOwned && !isEquipped && (
                    <button
                      onClick={() => handleEquipReel(reel.id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#334155',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Экипировать
                    </button>
                  )}

                  {isOwned && isEquipped && (
                    <div
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        textAlign: 'center',
                      }}
                    >
                      ✓ Экипировано
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {/* --- ВКЛАДКА 3: ЛЕСКИ --- */}
        {shopTab === 'lines' &&
          lines.map((line) => {
            const stockCount = gear?.lineStock?.[line.id] || 0;
            const isEquipped = equippedLineId === line.id && stockCount > 0;
            const price = (line as any).basePrice ?? (line as any).price ?? 50;
            const lvlReq = (line as any).levelReq ?? (line as any).minLevel ?? 1;
            const isLevelUnlocked = level >= lvlReq;
            const canAfford = coins >= price;
            const tensile = (line as any).maxTensileKg ?? (line as any).tensile ?? (line as any).strength ?? 1;

            return (
              <div
                key={line.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '14px',
                  padding: '12px',
                  border: isEquipped ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '24px' }}>🧵</span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{line.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Разрыв: <span style={{ color: '#38bdf8' }}>{tensile} кг</span> • Ур. {lvlReq}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '13px' }}>
                      {price} 🪙
                    </div>
                    <div style={{ fontSize: '11px', color: stockCount > 0 ? '#34d399' : '#94a3b8', marginTop: '2px' }}>
                      В наличии: {stockCount} шт.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    disabled={!canAfford || !isLevelUnlocked}
                    onClick={() => handleBuyLine(line)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: canAfford && isLevelUnlocked ? '#2563eb' : '#334155',
                      color: canAfford && isLevelUnlocked ? '#fff' : '#64748b',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: canAfford && isLevelUnlocked ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {!isLevelUnlocked ? `Требуется ${lvlReq} ур. 🔒` : `Купить (+1 шт)`}
                  </button>

                  {stockCount > 0 && !isEquipped && (
                    <button
                      onClick={() => handleEquipLine(line.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#059669',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Экипировать
                    </button>
                  )}

                  {isEquipped && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        textAlign: 'center',
                      }}
                    >
                      ✓ На удочке
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {/* --- ВКЛАДКА 4: НАЖИВКИ --- */}
        {shopTab === 'baits' &&
          AVAILABLE_BAITS.map((bait) => {
            const currentCount = baits[bait.id] || 0;
            const spaceLeft = Math.max(0, baitCapacity - currentCount);
            const isFull = spaceLeft <= 0;

            const basePackPrice = bait.price;
            const countToBuy = Math.min(5, spaceLeft);
            const pricePerUnit = basePackPrice / 5;
            const actualPrice =
              countToBuy > 0 ? Math.max(1, Math.round(countToBuy * pricePerUnit)) : basePackPrice;

            const canAfford = coins >= actualPrice;

            return (
              <div
                key={bait.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '14px',
                  padding: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '28px' }}>{bait.icon}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                      {bait.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      В банке:{' '}
                      <span style={{ color: isFull ? '#ef4444' : '#38bdf8', fontWeight: 'bold' }}>
                        {currentCount}
                      </span>
                      /{baitCapacity} шт.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontWeight: 'bold',
                      color: isFull ? '#64748b' : '#fbbf24',
                      fontSize: '13px',
                    }}
                  >
                    {isFull ? '—' : `${actualPrice} 🪙`}
                  </span>
                  <button
                    disabled={!canAfford || isFull}
                    onClick={() => onBuyBait(bait.id, 5, basePackPrice)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: canAfford && !isFull ? '#2563eb' : '#334155',
                      color: canAfford && !isFull ? '#fff' : '#64748b',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: canAfford && !isFull ? 'pointer' : 'not-allowed',
                      minWidth: '75px',
                    }}
                  >
                    {isFull ? 'Полно' : `+${countToBuy} шт.`}
                  </button>
                </div>
              </div>
            );
          })}

        {/* --- ВКЛАДКА 5: МАСТЕРСКАЯ --- */}
        {shopTab === 'upgrades' && (
          <>
            {/* 1. Вместимость банок */}
            {(() => {
              const lvl = upgrades?.baitCapacityLevel || 0;
              const cost = getUpgradeCost(lvl);
              const canAfford = coins >= cost;
              return (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '14px',
                    padding: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '28px' }}>🧰</span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                        Вместимость банок
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Ур. {lvl} • Лимит: <span style={{ color: '#38bdf8' }}>{baitCapacity} шт.</span> (+15 к банке)
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => onBuyUpgrade('baitCapacityLevel', cost)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: canAfford ? '#10b981' : '#334155',
                      color: canAfford ? '#fff' : '#64748b',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {cost} 🪙
                  </button>
                </div>
              );
            })()}

            {/* 2. Заточка крючков */}
            {(() => {
              const lvl = upgrades?.hookSharpenLevel || 0;
              const cost = getUpgradeCost(lvl);
              const canAfford = coins >= cost;
              return (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '14px',
                    padding: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '28px' }}>🪝</span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                        Заточка крючков
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Ур. {lvl} • Расширяет зелёную зону (+10%)
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => onBuyUpgrade('hookSharpenLevel', cost)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: canAfford ? '#10b981' : '#334155',
                      color: canAfford ? '#fff' : '#64748b',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {cost} 🪙
                  </button>
                </div>
              );
            })()}

            {/* 3. Смазка катушки */}
            {(() => {
              const lvl = upgrades?.reelOilLevel || 0;
              const cost = getUpgradeCost(lvl);
              const canAfford = coins >= cost;
              return (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '14px',
                    padding: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '28px' }}>🧴</span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                        Смазка катушки
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Ур. {lvl} • Ускоряет подмотку (+12%)
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => onBuyUpgrade('reelOilLevel', cost)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: canAfford ? '#10b981' : '#334155',
                      color: canAfford ? '#fff' : '#64748b',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {cost} 🪙
                  </button>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
};