import React, { useState } from 'react';
import * as GearData from '../gearData';
import type { RodTier, ReelTier, LineTier } from '../gearData';
import { AVAILABLE_BAITS, BAIT_CAPACITY_TIERS, type UpgradesState } from '../hooks/useBaitState';
import {
  getProvisionPrice,
  PROVISION_CONFIGS,
  type DailyProvisionsState,
  GEMS_ENERGY_DRINK_COST,
  MAX_DAILY_PROVISION_BUYS,
} from '../data/provisionsData';
import { CoinIcon } from './CoinIcon';

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
  energy?: number;
  maxEnergy?: number;
  gems?: number;
  dailyProvisions?: DailyProvisionsState;
  onBuyProvision?: (id: 'tea' | 'sandwich') => boolean | void;
  onBuyEnergyWithGems?: () => boolean | void;
}

type ShopTab = 'rods' | 'reels' | 'lines' | 'baits' | 'upgrades' | 'provisions';

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
    energy = 100,
    maxEnergy = 100,
    gems = 0,
    dailyProvisions = { date: '', teaBoughtCount: 0, sandwichBoughtCount: 0 },
    onBuyProvision,
    onBuyEnergyWithGems,
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
      {/* Шапка магазина в стиле дизайн-системы */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(22, 28, 38, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '12px 14px',
          borderRadius: '22px',
          border: '1.5px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
          >
            🏪
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
              Рыболовный магазин
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Снасти, наживки и экипировка
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(251, 191, 36, 0.16)',
            border: '1.5px solid rgba(251, 191, 36, 0.4)',
            borderRadius: '14px',
            padding: '6px 12px',
            color: '#fbbf24',
            fontWeight: 800,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <CoinIcon size={17} />
          <span>{coins.toLocaleString('ru-RU')}</span>
        </div>
      </div>

      {/* Вкладки категорий магазина */}
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
          { id: 'baits' as ShopTab, label: 'Наживки 🍞' },
          { id: 'upgrades' as ShopTab, label: 'Мастерская 🛠️' },
          { id: 'provisions' as ShopTab, label: 'Провизия ☕' },
        ].map((tab) => {
          const isActive = shopTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setShopTab(tab.id)}
              style={{
                flex: '0 0 auto',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.14) 100%)'
                  : 'rgba(22, 28, 38, 0.75)',
                border: isActive
                  ? '1.5px solid #f59e0b'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '8px 12px',
                color: isActive ? '#fef08a' : '#94a3b8',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: isActive ? '0 0 12px rgba(245, 158, 11, 0.25)' : 'none',
                transition: 'all 0.15s ease',
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
                    <span style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {price} <CoinIcon size={14} />
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      {!isLevelUnlocked ? `Требуется ${lvlReq} ур. 🔒` : (
                        <>Купить за {price} <CoinIcon size={14} /></>
                      )}
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
                    <span style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {price} <CoinIcon size={14} />
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      {!isLevelUnlocked ? `Требуется ${lvlReq} ур. 🔒` : (
                        <>Купить за {price} <CoinIcon size={14} /></>
                      )}
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
                    <div style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                      {price} <CoinIcon size={14} />
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
            const isLocked = level < (bait.levelReq || 1);

            const countToBuy = Math.min(spaceLeft, 3);
            const actualPrice = countToBuy * bait.price;
            const canAfford = coins >= actualPrice;

            return (
              <div
                key={bait.id}
                style={{
                  background: isLocked ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '14px',
                  padding: '12px',
                  border: isLocked
                    ? '1px dashed rgba(255, 255, 255, 0.06)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: isLocked ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: isLocked
                        ? '1.5px solid rgba(148, 163, 184, 0.2)'
                        : '1.5px solid rgba(251, 191, 36, 0.35)',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
                      position: 'relative',
                      filter: isLocked ? 'grayscale(0.6)' : 'none',
                    }}
                  >
                    <img
                      src={bait.image}
                      alt={bait.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    {isLocked && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                        }}
                      >
                        🔒
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                        {bait.name}
                      </span>
                      {isLocked && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#fbbf24',
                            background: 'rgba(251, 191, 36, 0.15)',
                            padding: '1px 6px',
                            borderRadius: '6px',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                          }}
                        >
                          С {bait.levelReq} ур.
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {isLocked ? (
                        bait.description
                      ) : (
                        <>
                          В банке:{' '}
                          <span style={{ color: isFull ? '#ef4444' : '#38bdf8', fontWeight: 'bold' }}>
                            {currentCount}
                          </span>
                          /{baitCapacity} шт.
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isLocked && (
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: isFull ? '#64748b' : '#fbbf24',
                        fontSize: '13px',
                      }}
                    >
                      {isFull ? '—' : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          {actualPrice} <CoinIcon size={14} />
                        </span>
                      )}
                    </span>
                  )}
                  <button
                    disabled={isLocked || !canAfford || isFull}
                    onClick={() => onBuyBait(bait.id, countToBuy, actualPrice)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isLocked
                        ? '#1e293b'
                        : canAfford && !isFull
                        ? '#2563eb'
                        : '#334155',
                      color: isLocked || !canAfford || isFull ? '#64748b' : '#fff',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: isLocked || !canAfford || isFull ? 'not-allowed' : 'pointer',
                      minWidth: '78px',
                    }}
                  >
                    {isLocked ? '🔒 Замок' : isFull ? 'Полно' : `+${countToBuy} шт.`}
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
              const currentLvl = upgrades?.baitCapacityLevel || 0;
              const nextTier = BAIT_CAPACITY_TIERS[currentLvl + 1];
              const isMax = !nextTier;

              const reqLvl = nextTier?.reqPlayerLevel || 1;
              const cost = nextTier?.cost || 0;
              const hasLevel = level >= reqLvl;
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
                        {isMax ? (
                          <span style={{ color: '#4ade80' }}>Максимальный лимит: 15 шт.</span>
                        ) : (
                          <>
                            Ур. {currentLvl} • Лимит: <span style={{ color: '#38bdf8' }}>{baitCapacity}</span> ➔ <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{nextTier.capacity} шт.</span>
                            {!hasLevel && (
                              <span style={{ color: '#f59e0b', marginLeft: '6px' }}>
                                (С {reqLvl} ур.)
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isMax || !hasLevel || !canAfford}
                    onClick={() => onBuyUpgrade('baitCapacityLevel', cost)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isMax
                        ? '#334155'
                        : !hasLevel
                        ? '#1e293b'
                        : canAfford
                        ? '#10b981'
                        : '#334155',
                      color: isMax || !hasLevel || !canAfford ? '#64748b' : '#fff',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: isMax || !hasLevel || !canAfford ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isMax ? (
                      'МАКС.'
                    ) : !hasLevel ? (
                      `С ${reqLvl} ур.`
                    ) : (
                      <>
                        {cost} <CoinIcon size={14} />
                      </>
                    )}
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {cost} <CoinIcon size={14} />
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {cost} <CoinIcon size={14} />
                  </button>
                </div>
              );
            })()}
          </>
        )}

        {/* Провизия (Чай и Бутерброды для энергии) */}
        {shopTab === 'provisions' && (
          <>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.06))',
                borderRadius: '16px',
                padding: '12px 14px',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#fef3c7' }}>
                  Запас энергии рыболова
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Расход: 5 ⚡ за заброс удочки • +1 ⚡ в минуту
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#fbbf24' }}>
                  {energy} / {maxEnergy} ⚡
                </span>
              </div>
            </div>

            {/* 1. Чай из термоса со ступенчатой ценой */}
            {(() => {
              const config = PROVISION_CONFIGS.tea;
              const count = dailyProvisions.teaBoughtCount;
              const price = getProvisionPrice('tea', count);
              const isLimit = price === null;
              const isFull = energy >= maxEnergy;
              const canAfford = price !== null && coins >= price;
              const isDisabled = isFull || isLimit || !canAfford;

              return (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1.5px solid rgba(245, 158, 11, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        flexShrink: 0,
                      }}
                    >
                      {config.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>
                          {config.name}
                        </span>
                        <span
                          style={{
                            background: 'rgba(34, 197, 94, 0.2)',
                            color: '#4ade80',
                            border: '1px solid rgba(34, 197, 94, 0.4)',
                            borderRadius: '6px',
                            padding: '1px 6px',
                            fontSize: '10px',
                            fontWeight: 900,
                          }}
                        >
                          +{config.energyBonus} ⚡
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.3 }}>
                        Сегодня куплено: <strong style={{ color: count >= MAX_DAILY_PROVISION_BUYS ? '#ef4444' : '#86efac' }}>{count}/{MAX_DAILY_PROVISION_BUYS}</strong> • +5 забросов
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isDisabled}
                    onClick={() => onBuyProvision && onBuyProvision('tea')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: isDisabled
                        ? '#334155'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: isDisabled ? '#64748b' : '#fff',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      boxShadow: isDisabled
                        ? 'none'
                        : '0 4px 12px rgba(16, 185, 129, 0.4)',
                      flexShrink: 0,
                      minWidth: '88px',
                    }}
                  >
                    {isLimit ? (
                      <span style={{ fontSize: '11px', fontWeight: 900, color: '#f87171' }}>Лимит (5/5)</span>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{price}</span>
                          <CoinIcon size={13} />
                        </div>
                        <span style={{ fontSize: '10px', opacity: 0.9 }}>
                          {isFull ? 'Сыт' : 'Выпить'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}

            {/* 2. Бутерброд с ветчиной со ступенчатой ценой */}
            {(() => {
              const config = PROVISION_CONFIGS.sandwich;
              const count = dailyProvisions.sandwichBoughtCount;
              const price = getProvisionPrice('sandwich', count);
              const isLimit = price === null;
              const isFull = energy >= maxEnergy;
              const canAfford = price !== null && coins >= price;
              const isDisabled = isFull || isLimit || !canAfford;

              return (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1.5px solid rgba(245, 158, 11, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        flexShrink: 0,
                      }}
                    >
                      {config.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>
                          {config.name}
                        </span>
                        <span
                          style={{
                            background: 'rgba(34, 197, 94, 0.2)',
                            color: '#4ade80',
                            border: '1px solid rgba(34, 197, 94, 0.4)',
                            borderRadius: '6px',
                            padding: '1px 6px',
                            fontSize: '10px',
                            fontWeight: 900,
                          }}
                        >
                          +{config.energyBonus} ⚡
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.3 }}>
                        Сегодня куплено: <strong style={{ color: count >= MAX_DAILY_PROVISION_BUYS ? '#ef4444' : '#86efac' }}>{count}/{MAX_DAILY_PROVISION_BUYS}</strong> • +10 забросов
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isDisabled}
                    onClick={() => onBuyProvision && onBuyProvision('sandwich')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: isDisabled
                        ? '#334155'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: isDisabled ? '#64748b' : '#fff',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      boxShadow: isDisabled
                        ? 'none'
                        : '0 4px 12px rgba(16, 185, 129, 0.4)',
                      flexShrink: 0,
                      minWidth: '88px',
                    }}
                  >
                    {isLimit ? (
                      <span style={{ fontSize: '11px', fontWeight: 900, color: '#f87171' }}>Лимит (5/5)</span>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{price}</span>
                          <CoinIcon size={13} />
                        </div>
                        <span style={{ fontSize: '10px', opacity: 0.9 }}>
                          {isFull ? 'Сыт' : 'Съесть'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}

            {/* 3. Особый энергетик за Алмазы (безлимитно) */}
            {onBuyEnergyWithGems && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(79, 70, 229, 0.08))',
                  borderRadius: '16px',
                  padding: '14px',
                  border: '1.5px solid rgba(99, 102, 241, 0.4)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'rgba(30, 27, 75, 0.6)',
                      border: '1.5px solid rgba(99, 102, 241, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      flexShrink: 0,
                    }}
                  >
                    ⚡
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#e0e7ff' }}>
                        Энергетик егеря
                      </span>
                      <span
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          color: '#fff',
                          borderRadius: '6px',
                          padding: '1px 6px',
                          fontSize: '10px',
                          fontWeight: 900,
                        }}
                      >
                        +100 ⚡ (МАКС)
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#c7d2fe', lineHeight: 1.3 }}>
                      Полный бак энергии • Доступно без ограничений в день
                    </div>
                  </div>
                </div>

                <button
                  disabled={energy >= maxEnergy || gems < GEMS_ENERGY_DRINK_COST}
                  onClick={() => onBuyEnergyWithGems()}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: energy >= maxEnergy || gems < GEMS_ENERGY_DRINK_COST
                      ? '#334155'
                      : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: energy >= maxEnergy || gems < GEMS_ENERGY_DRINK_COST ? '#64748b' : '#fff',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: energy >= maxEnergy || gems < GEMS_ENERGY_DRINK_COST ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    boxShadow: energy >= maxEnergy || gems < GEMS_ENERGY_DRINK_COST
                      ? 'none'
                      : '0 4px 12px rgba(99, 102, 241, 0.4)',
                    flexShrink: 0,
                    minWidth: '88px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{GEMS_ENERGY_DRINK_COST}</span>
                    <span>💎</span>
                  </div>
                  <span style={{ fontSize: '10px', opacity: 0.9 }}>
                    {energy >= maxEnergy ? 'Сыт' : 'Полный бак'}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};