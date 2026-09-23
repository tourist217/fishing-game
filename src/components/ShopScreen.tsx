import { useState } from 'react';
import { BAITS } from '../baitData';
import {
  ROD_TIERS,
  REEL_TIERS,
  LINE_TIERS,
  getRodStrength,
  getRodUpgradeCost,
  getReelPullSpeed,
  getReelUpgradeCost,
  type RodTier,
  type ReelTier,
  type LineTier,
  type PlayerGearState,
} from '../gearData';

export interface UpgradesState {
  baitCapacityLevel: number;
  hookSharpenLevel: number;
  reelOilLevel: number;
}

interface ShopScreenProps {
  coins: number;
  level: number;
  gear: PlayerGearState;
  baits: Record<string, number>;
  baitCapacity: number;
  upgrades: UpgradesState;
  onBuyRod: (rod: RodTier) => void;
  onUpgradeRod: (rod: RodTier) => void;
  onEquipRod: (rodId: string) => void;
  onBuyReel: (reel: ReelTier) => void;
  onUpgradeReel: (reel: ReelTier) => void;
  onEquipReel: (reelId: string | null) => void;
  onBuyLine: (line: LineTier) => void;
  onEquipLine: (lineId: string) => void;
  onBuyBait: (baitId: string, amount: number, totalCost: number) => void;
  onBuyUpgrade: (type: keyof UpgradesState, cost: number) => void;
}

type ShopTab = 'rods' | 'reels' | 'lines' | 'baits' | 'workshop';

export const ShopScreen = ({
  coins,
  level,
  gear,
  baits,
  baitCapacity,
  upgrades,
  onBuyRod,
  onUpgradeRod,
  onEquipRod,
  onBuyReel,
  onUpgradeReel,
  onEquipReel,
  onBuyLine,
  onEquipLine,
  onBuyBait,
  onBuyUpgrade,
}: ShopScreenProps) => {
  const [shopTab, setShopTab] = useState<ShopTab>('rods');

  const currentRod = ROD_TIERS.find((r) => r.id === gear.equippedRodId) || ROD_TIERS[0];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        margin: '12px 0',
      }}
    >
      {/* Меню категорий магазина */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '8px',
        }}
      >
        {[
          { id: 'rods', label: 'Удилища 🎋' },
          { id: 'reels', label: 'Катушки ⚙️' },
          { id: 'lines', label: 'Леска 🧵' },
          { id: 'baits', label: 'Наживки 🪱' },
          { id: 'workshop', label: 'Цех 🛠️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setShopTab(tab.id as ShopTab)}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              background: shopTab === tab.id ? '#2563eb' : 'rgba(255,255,255,0.06)',
              color: shopTab === tab.id ? '#fff' : '#94a3b8',
              fontWeight: 'bold',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Список товаров */}
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
        {/* --- ВКЛАДКА 1: УДИЛИЩА --- */}
        {shopTab === 'rods' &&
          ROD_TIERS.map((rod) => {
            const isOwned = gear.ownedRods.includes(rod.id);
            const isEquipped = gear.equippedRodId === rod.id;
            const currentLvl = gear.rodLevels[rod.id] || 1;
            const strength = getRodStrength(rod, currentLvl);
            const upgradeCost = getRodUpgradeCost(rod, currentLvl + 1);
            const canAfford = coins >= rod.basePrice;
            const canAffordUpgrade = coins >= upgradeCost;
            const isLevelUnlocked = level >= rod.levelReq;

            return (
              <div
                key={rod.id}
                style={{
                  background: isEquipped ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '14px',
                  padding: '12px',
                  border: isEquipped ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '28px' }}>{rod.icon}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {rod.name} {isOwned && <span style={{ color: '#38bdf8' }}>[{currentLvl}/5 ур.]</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Тест: <strong style={{ color: '#4ade80' }}>до {strength} кг</strong>
                        {!rod.canMountReel && ' (без катушки)'}
                      </div>
                    </div>
                  </div>

                  {!isOwned && (
                    <div style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '13px' }}>
                      {rod.basePrice} 🪙
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{rod.description}</div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {!isOwned && (
                    <button
                      disabled={!canAfford || !isLevelUnlocked}
                      onClick={() => onBuyRod(rod)}
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
                      {!isLevelUnlocked ? `Требуется ${rod.levelReq} ур. 🔒` : `Купить за ${rod.basePrice} 🪙`}
                    </button>
                  )}

                  {isOwned && !isEquipped && (
                    <button
                      onClick={() => onEquipRod(rod.id)}
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
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#4ade80',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        textAlign: 'center',
                      }}
                    >
                      В руках ✓
                    </div>
                  )}

                  {isOwned && currentLvl < 5 && (
                    <button
                      disabled={!canAffordUpgrade}
                      onClick={() => onUpgradeRod(rod)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: canAffordUpgrade ? '#16a34a' : '#1e293b',
                        color: canAffordUpgrade ? '#fff' : '#64748b',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: canAffordUpgrade ? 'pointer' : 'not-allowed',
                      }}
                    >
                      +Прочность: {upgradeCost} 🪙
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        {/* --- ВКЛАДКА 2: КАТУШКИ --- */}
        {shopTab === 'reels' && (
          <>
            {!currentRod.canMountReel && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  color: '#f87171',
                  fontSize: '12px',
                  textAlign: 'center',
                }}
              >
                На текущем удилище ({currentRod.name}) нет катушкодержателя. Купите бамбуковую удочку или выше!
              </div>
            )}

            {REEL_TIERS.map((reel) => {
              const isOwned = gear.ownedReels.includes(reel.id);
              const isEquipped = gear.equippedReelId === reel.id;
              const currentLvl = gear.reelLevels[reel.id] || 1;
              const pullSpeed = getReelPullSpeed(reel, currentLvl);
              const upgradeCost = getReelUpgradeCost(reel, currentLvl + 1);
              const canAfford = coins >= reel.basePrice;
              const canAffordUpgrade = coins >= upgradeCost;
              const isLevelUnlocked = level >= reel.levelReq;
              const canEquipOnCurrentRod = currentRod.canMountReel;

              return (
                <div
                  key={reel.id}
                  style={{
                    background: isEquipped ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '14px',
                    padding: '12px',
                    border: isEquipped ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '28px' }}>{reel.icon}</span>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                          {reel.name} {isOwned && <span style={{ color: '#38bdf8' }}>[{currentLvl}/3 ур.]</span>}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Скорость смотки: <strong style={{ color: '#38bdf8' }}>x{pullSpeed}</strong>
                        </div>
                      </div>
                    </div>

                    {!isOwned && (
                      <div style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '13px' }}>
                        {reel.basePrice} 🪙
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{reel.description}</div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {!isOwned && (
                      <button
                        disabled={!canAfford || !isLevelUnlocked}
                        onClick={() => onBuyReel(reel)}
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
                        {!isLevelUnlocked ? `Требуется ${reel.levelReq} ур. 🔒` : `Купить за ${reel.basePrice} 🪙`}
                      </button>
                    )}

                    {isOwned && !isEquipped && (
                      <button
                        disabled={!canEquipOnCurrentRod}
                        onClick={() => onEquipReel(reel.id)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '8px',
                          border: 'none',
                          background: canEquipOnCurrentRod ? '#334155' : '#1e293b',
                          color: canEquipOnCurrentRod ? '#fff' : '#64748b',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: canEquipOnCurrentRod ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Установить
                      </button>
                    )}

                    {isOwned && isEquipped && (
                      <button
                        onClick={() => onEquipReel(null)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'rgba(34, 197, 94, 0.2)',
                          color: '#4ade80',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Установлена ✓ (Снять)
                      </button>
                    )}

                    {isOwned && currentLvl < 3 && (
                      <button
                        disabled={!canAffordUpgrade}
                        onClick={() => onUpgradeReel(reel)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '8px',
                          border: 'none',
                          background: canAffordUpgrade ? '#16a34a' : '#1e293b',
                          color: canAffordUpgrade ? '#fff' : '#64748b',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: canAffordUpgrade ? 'pointer' : 'not-allowed',
                        }}
                      >
                        +Скорость: {upgradeCost} 🪙
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* --- ВКЛАДКА 3: ЛЕСКА --- */}
        {shopTab === 'lines' &&
          LINE_TIERS.map((line) => {
            const isEquipped = gear.equippedLineId === line.id;
            const stockCount = gear.lineStock[line.id] || 0;
            const isLevelUnlocked = level >= line.levelReq;
            const canAfford = coins >= line.price;

            return (
              <div
                key={line.id}
                style={{
                  background: isEquipped ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '14px',
                  padding: '12px',
                  border: isEquipped ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '28px' }}>{line.icon}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{line.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Разрыв: <strong style={{ color: '#4ade80' }}>до {line.maxTensileKg} кг</strong> | В запасе: {stockCount} шт.
                      </div>
                    </div>
                  </div>

                  <div style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '13px' }}>
                    {line.price} 🪙
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{line.description}</div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    disabled={!canAfford || !isLevelUnlocked}
                    onClick={() => onBuyLine(line)}
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
                    {!isLevelUnlocked ? `Требуется ${line.levelReq} ур. 🔒` : `Купить бобину (+1)`}
                  </button>

                  {stockCount > 0 && !isEquipped && (
                    <button
                      onClick={() => onEquipLine(line.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#334155',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Намотать
                    </button>
                  )}

                  {isEquipped && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#4ade80',
                        fontWeight: 'bold',
                        fontSize: '12px',
                      }}
                    >
                      Намотана ✓
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {/* --- ВКЛАДКА 4: НАЖИВКИ --- */}
        {shopTab === 'baits' &&
          BAITS.map((bait) => {
            const currentCount = baits[bait.id] || 0;
            const isFull = currentCount >= baitCapacity;
            // Безопасно получаем цену наживки независимо от имени поля в типе Bait
            const baitPrice = (bait as any).price ?? (bait as any).cost ?? 20;
            const canAfford = coins >= baitPrice;

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
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{bait.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      В банке: {currentCount}/{baitCapacity} шт.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '13px' }}>
                    {baitPrice} 🪙
                  </span>
                  <button
                    disabled={!canAfford || isFull}
                    onClick={() => onBuyBait(bait.id, 5, baitPrice)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: canAfford && !isFull ? '#2563eb' : '#334155',
                      color: canAfford && !isFull ? '#fff' : '#64748b',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: canAfford && !isFull ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {isFull ? 'Полно' : '+5 шт.'}
                  </button>
                </div>
              </div>
            );
          })}

        {/* --- ВКЛАДКА 5: МАСТЕРСКАЯ --- */}
        {shopTab === 'workshop' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Вместимость банки наживок 🪣</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Текущий лимит: {baitCapacity} шт.
                </div>
              </div>
              <button
                disabled={upgrades.baitCapacityLevel >= 3 || coins < 250 * (upgrades.baitCapacityLevel + 1)}
                onClick={() => onBuyUpgrade('baitCapacityLevel', 250 * (upgrades.baitCapacityLevel + 1))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: upgrades.baitCapacityLevel < 3 ? '#2563eb' : '#334155',
                  color: upgrades.baitCapacityLevel < 3 ? '#fff' : '#64748b',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: upgrades.baitCapacityLevel < 3 ? 'pointer' : 'not-allowed',
                }}
              >
                {upgrades.baitCapacityLevel >= 3 ? 'МАКС' : `+10 мест (${250 * (upgrades.baitCapacityLevel + 1)} 🪙)`}
              </button>
            </div>

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
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Заточка крючков 🪝</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Расширяет зелёную зону подсечки (+5% за ур.)
                </div>
              </div>
              <button
                disabled={upgrades.hookSharpenLevel >= 5 || coins < 180 * (upgrades.hookSharpenLevel + 1)}
                onClick={() => onBuyUpgrade('hookSharpenLevel', 180 * (upgrades.hookSharpenLevel + 1))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: upgrades.hookSharpenLevel < 5 ? '#2563eb' : '#334155',
                  color: upgrades.hookSharpenLevel < 5 ? '#fff' : '#64748b',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: upgrades.hookSharpenLevel < 5 ? 'pointer' : 'not-allowed',
                }}
              >
                {upgrades.hookSharpenLevel >= 5 ? 'МАКС' : `Улучшить (${180 * (upgrades.hookSharpenLevel + 1)} 🪙)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};