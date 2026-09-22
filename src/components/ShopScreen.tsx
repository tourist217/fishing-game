import { useState } from 'react';
import { RODS, type Rod } from '../shopData';
import { BAITS } from '../baitData';

export interface UpgradesState {
  baitCapacityLevel: number; // 0: 10 шт, 1: 20 шт, 2: 30 шт, 3: 50 шт
  hookSharpenLevel: number;  // 0, 1, 2, 3 (+5% зоны за каждый уровень)
  reelOilLevel: number;      // 0, 1, 2, 3 (+15% скорости смотки за уровень)
}

interface ShopScreenProps {
  coins: number;
  level: number;
  equippedRodId: string;
  ownedRods: string[];
  baits: Record<string, number>;
  baitCapacity: number;
  upgrades: UpgradesState;
  onBuyRod: (rod: Rod) => void;
  onEquipRod: (rodId: string) => void;
  onBuyBait: (baitId: string, amount: number, totalCost: number) => void;
  onBuyUpgrade: (type: keyof UpgradesState, cost: number) => void;
}

export const ShopScreen = ({
  coins,
  level,
  equippedRodId,
  ownedRods,
  baits,
  baitCapacity,
  upgrades,
  onBuyRod,
  onEquipRod,
  onBuyBait,
  onBuyUpgrade,
}: ShopScreenProps) => {
  const [shopTab, setShopTab] = useState<'rods' | 'baits' | 'upgrades'>('rods');

  // Стоимости улучшений
  const capacityPrices = [50, 120, 250];
  const hookPrices = [40, 90, 180];
  const reelPrices = [45, 100, 200];

  const nextCapacityCost = capacityPrices[upgrades.baitCapacityLevel];
  const nextHookCost = hookPrices[upgrades.hookSharpenLevel];
  const nextReelCost = reelPrices[upgrades.reelOilLevel];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        margin: '16px 0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Магазин 🛒</h2>

        {/* Переключатель секций магазина */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '2px', gap: '2px' }}>
          <button
            onClick={() => setShopTab('rods')}
            style={{
              padding: '6px 10px',
              border: 'none',
              borderRadius: '8px',
              background: shopTab === 'rods' ? '#2563eb' : 'transparent',
              color: shopTab === 'rods' ? '#fff' : '#94a3b8',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Удочки 🎣
          </button>
          <button
            onClick={() => setShopTab('baits')}
            style={{
              padding: '6px 10px',
              border: 'none',
              borderRadius: '8px',
              background: shopTab === 'baits' ? '#2563eb' : 'transparent',
              color: shopTab === 'baits' ? '#fff' : '#94a3b8',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Наживки 🪱
          </button>
          <button
            onClick={() => setShopTab('upgrades')}
            style={{
              padding: '6px 10px',
              border: 'none',
              borderRadius: '8px',
              background: shopTab === 'upgrades' ? '#2563eb' : 'transparent',
              color: shopTab === 'upgrades' ? '#fff' : '#94a3b8',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Бафы ⭐
          </button>
        </div>
      </div>

      {/* Секция удочек */}
      {shopTab === 'rods' && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          {RODS.map((rod) => {
            const isOwned = ownedRods.includes(rod.id);
            const isEquipped = equippedRodId === rod.id;
            const canAfford = coins >= rod.price && level >= rod.levelReq;

            return (
              <div
                key={rod.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  background: isEquipped ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '14px',
                  border: isEquipped ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ fontSize: '36px' }}>{rod.icon}</div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{rod.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Требуется уровень: {rod.levelReq}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                  <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '4px 8px', borderRadius: '6px' }}>
                    Зона: +{rod.sweetSpotBonus}%
                  </span>
                  <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fcd34d', padding: '4px 8px', borderRadius: '6px' }}>
                    Золото: x{rod.goldBonus}
                  </span>
                </div>

                {isEquipped ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '8px',
                      background: '#1e3a8a',
                      color: '#93c5fd',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                    }}
                  >
                    Экипировано ✔
                  </div>
                ) : isOwned ? (
                  <button
                    onClick={() => onEquipRod(rod.id)}
                    style={{
                      padding: '10px',
                      background: '#334155',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Экипировать
                  </button>
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={() => onBuyRod(rod)}
                    style={{
                      padding: '10px',
                      background: canAfford ? '#eab308' : '#334155',
                      border: 'none',
                      color: canAfford ? '#000000' : '#64748b',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Купить за {rod.price} 🪙 {level < rod.levelReq && `(Нужен ур. ${rod.levelReq})`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Секция наживок */}
      {shopTab === 'baits' && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '10px' }}>
            Банка вмещает до <strong>{baitCapacity} шт.</strong> каждого вида наживки.
          </div>

          {BAITS.map((bait) => {
            const currentCount = baits[bait.id] || 0;
            const isFull = currentCount >= baitCapacity;
            const canBuy1 = coins >= bait.pricePerPiece && !isFull;
            const canBuyPack = coins >= bait.pricePerPiece * bait.packSize && (currentCount + bait.packSize <= baitCapacity);

            return (
              <div
                key={bait.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ fontSize: '32px' }}>{bait.icon}</div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{bait.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{bait.description}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: isFull ? '#ef4444' : '#38bdf8' }}>
                      {currentCount} / {baitCapacity} шт.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={!canBuy1}
                    onClick={() => onBuyBait(bait.id, 1, bait.pricePerPiece)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: canBuy1 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.05)',
                      border: canBuy1 ? '1px solid #fbbf24' : '1px solid transparent',
                      color: canBuy1 ? '#fbbf24' : '#64748b',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: canBuy1 ? 'pointer' : 'not-allowed',
                    }}
                  >
                    +1 шт. ({bait.pricePerPiece} 🪙)
                  </button>
                  <button
                    disabled={!canBuyPack}
                    onClick={() => onBuyBait(bait.id, bait.packSize, bait.pricePerPiece * bait.packSize)}
                    style={{
                      flex: 1.2,
                      padding: '8px',
                      background: canBuyPack ? '#eab308' : '#334155',
                      border: 'none',
                      color: canBuyPack ? '#000000' : '#64748b',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: canBuyPack ? 'pointer' : 'not-allowed',
                    }}
                  >
                    +10 шт. ({bait.pricePerPiece * bait.packSize} 🪙)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Секция бафов и улучшений */}
      {shopTab === 'upgrades' && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          {/* 1. Вместимость банки */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '32px' }}>🫙</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Большая банка наживок</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Текущая вместимость: {baitCapacity} шт.</div>
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 'bold' }}>
                Ур. {upgrades.baitCapacityLevel}/3
              </span>
            </div>
            {nextCapacityCost ? (
              <button
                disabled={coins < nextCapacityCost}
                onClick={() => onBuyUpgrade('baitCapacityLevel', nextCapacityCost)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: coins >= nextCapacityCost ? '#eab308' : '#334155',
                  color: coins >= nextCapacityCost ? '#000' : '#64748b',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: coins >= nextCapacityCost ? 'pointer' : 'not-allowed',
                }}
              >
                Расширить (+10–20 мест) за {nextCapacityCost} 🪙
              </button>
            ) : (
              <div style={{ textAlign: 'center', color: '#4ade80', fontSize: '12px', fontWeight: 'bold', padding: '8px' }}>
                Максимальный уровень ✔
              </div>
            )}
          </div>

          {/* 2. Заточка крючков */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '32px' }}>🪝</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Острые японские крючки</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    +{upgrades.hookSharpenLevel * 5}% к зелёной зоне вываживания
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 'bold' }}>
                Ур. {upgrades.hookSharpenLevel}/3
              </span>
            </div>
            {nextHookCost ? (
              <button
                disabled={coins < nextHookCost}
                onClick={() => onBuyUpgrade('hookSharpenLevel', nextHookCost)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: coins >= nextHookCost ? '#eab308' : '#334155',
                  color: coins >= nextHookCost ? '#000' : '#64748b',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: coins >= nextHookCost ? 'pointer' : 'not-allowed',
                }}
              >
                Заточить (+5% к зоне) за {nextHookCost} 🪙
              </button>
            ) : (
              <div style={{ textAlign: 'center', color: '#4ade80', fontSize: '12px', fontWeight: 'bold', padding: '8px' }}>
                Максимальный уровень ✔
              </div>
            )}
          </div>

          {/* 3. Смазка для катушки */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '32px' }}>⚙️</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Синтетическая смазка катушки</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    +{upgrades.reelOilLevel * 15}% к скорости подмотки рыбы
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 'bold' }}>
                Ур. {upgrades.reelOilLevel}/3
              </span>
            </div>
            {nextReelCost ? (
              <button
                disabled={coins < nextReelCost}
                onClick={() => onBuyUpgrade('reelOilLevel', nextReelCost)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: coins >= nextReelCost ? '#eab308' : '#334155',
                  color: coins >= nextReelCost ? '#000' : '#64748b',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: coins >= nextReelCost ? 'pointer' : 'not-allowed',
                }}
              >
                Улучшить (+15% к скорости) за {nextReelCost} 🪙
              </button>
            ) : (
              <div style={{ textAlign: 'center', color: '#4ade80', fontSize: '12px', fontWeight: 'bold', padding: '8px' }}>
                Максимальный уровень ✔
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};