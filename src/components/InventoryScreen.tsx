import React from 'react';
import type { Fish, FishSizeCategory } from '../fishData';
import { formatWeight } from '../utils/fishUtils';
import { CoinIcon } from './CoinIcon';
import { GemIcon } from './GemIcon';
import { triggerHaptic } from '../utils/haptics';
import { BoardHeader } from './BoardHeader';

export interface CaughtFishItem {
  fish: Fish;
  weight: number;
  price: number;
  exp: number;
  uid: string;
  caughtAt: number;
  sizeCategory?: FishSizeCategory;
  categoryLabel?: string;
}

interface InventoryScreenProps {
  inventory: CaughtFishItem[];
  maxCapacity?: number;
  getRarityLabel: (rarity: string) => { text: string; color: string };
  onSellFish: (uid: string, price: number) => void;
  onSellAll: () => void;
  onClose?: () => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  inventory,
  maxCapacity = 15,
  getRarityLabel: _getRarityLabel,
  onSellFish,
  onSellAll,
  onClose,
}) => {
  const totalValue = inventory.reduce((sum, item) => sum + (Number(item.price) || 1), 0);
  const trophyCount = inventory.filter((item) => item.sizeCategory === 'trophy').length;
  const capacityPercent = Math.min(100, (inventory.length / maxCapacity) * 100);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: 'max(4px, env(safe-area-inset-top, 4px)) 4px 6px 4px',
        width: '100%',
        userSelect: 'none',
      }}
    >
      {/* 1. СЛОЙ ФОНА: Универсальная деревянная доска */}
      <div
        style={{
          position: 'relative',
          width: 'min(calc((100dvh - 84px) * 0.727), 100vw - 12px, 430px)',
          aspectRatio: '745 / 1024',
          maxHeight: 'calc(100dvh - 84px)',
          backgroundImage: "url('/assets/ui/universal_board.png')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'drop-shadow(0 14px 36px rgba(0, 0, 0, 0.85))',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* 2. СЛОЙ ЗАГОЛОВКА: Единый 3D золотой заголовок поверх верхней деревянной планки */}
        <BoardHeader
          title="Садок рыбака"
          subtitle={`Заполнено: ${inventory.length}/${maxCapacity} • Улов на ${totalValue} монет`}
        />

        {/* 3. СЛОЙ КНОПКИ ЗАКРЫТИЯ (Круглый красный крестик в правом верхнем углу) */}
        {onClose && (
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            aria-label="Закрыть"
            style={{
              position: 'absolute',
              right: '5.5%',
              top: '4.0%',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)',
              border: '1.5px solid rgba(254, 202, 202, 0.7)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.65)',
              zIndex: 20,
              transition: 'transform 0.1s ease',
            }}
          >
            ✕
          </button>
        )}

        {/* 4. СЛОЙ КОНТЕНТА: Рабочая область внутри деревянной рамы */}
        <div
          style={{
            position: 'absolute',
            left: '7.5%',
            right: '7.5%',
            top: '12.8%',
            bottom: '6.2%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '2px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {/* Информационная панель садка */}
          <div
            style={{
              background: 'rgba(25, 14, 7, 0.85)',
              border: '1px solid rgba(251, 191, 36, 0.28)',
              borderRadius: '14px',
              padding: '7px 10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src="/assets/ui/keepnet_basket.png"
                alt="Садок"
                style={{
                  width: '44px',
                  height: '44px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: '11px', color: '#fed7aa', fontWeight: 800 }}>
                  Вместимость садка
                </div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: inventory.length >= maxCapacity ? '#f87171' : '#fef08a' }}>
                  {inventory.length} / {maxCapacity} рыб
                </div>
                <div
                  style={{
                    width: '80px',
                    height: '5px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginTop: '2px',
                  }}
                >
                  <div
                    style={{
                      width: `${capacityPercent}%`,
                      height: '100%',
                      background: inventory.length >= maxCapacity ? '#ef4444' : '#22c55e',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Кнопка «Продать всё» */}
            {inventory.length > 0 && (
              <button
                onClick={() => {
                  triggerHaptic('notification');
                  onSellAll();
                }}
                style={{
                  background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                  border: '1.5px solid #86efac',
                  borderRadius: '12px',
                  padding: '7px 11px',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 0 12px rgba(34, 197, 94, 0.65)',
                  flexShrink: 0,
                }}
              >
                <span>Продать всё</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#fef08a' }}>
                  +{totalValue} <CoinIcon size={13} />
                </span>
                {trophyCount > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#7dd3fc' }}>
                    +{trophyCount * 5} <GemIcon size={12} />
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Список выловленных рыб */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              paddingRight: '2px',
            }}
          >
            {inventory.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#fed7aa',
                  gap: '10px',
                  padding: '30px 16px',
                  background: 'rgba(20, 10, 5, 0.55)',
                  borderRadius: '16px',
                  border: '1.5px dashed rgba(217, 119, 6, 0.35)',
                }}
              >
                <img
                  src="/assets/ui/keepnet_basket.png"
                  alt="Пустой садок"
                  style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))',
                    opacity: 0.9,
                  }}
                />
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 900,
                    color: '#fef3c7',
                    textAlign: 'center',
                  }}
                >
                  Садок сейчас пуст
                </div>
                <div
                  style={{
                    fontSize: '11.5px',
                    color: '#fed7aa',
                    textAlign: 'center',
                    maxWidth: '220px',
                    lineHeight: '1.35',
                  }}
                >
                  Отправляйтесь на водоём, выберите наживку и сделайте первый заброс!
                </div>
              </div>
            ) : (
              inventory.map((item, index) => {
                const itemPrice = Number(item.price) || 1;
                const itemUid = item.uid || `fish_${index}`;
                const isTrophy = item.sizeCategory === 'trophy';

                return (
                  <div
                    key={itemUid}
                    style={{
                      background: 'rgba(25, 14, 7, 0.82)',
                      border: isTrophy ? '1.5px solid #facc15' : '1px solid rgba(251, 191, 36, 0.25)',
                      borderRadius: '13px',
                      padding: '7px 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: isTrophy ? '0 0 10px rgba(250, 204, 21, 0.35)' : '0 2px 5px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      {/* Иконка / медальон рыбы */}
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, #542b0e 0%, #2b1405 100%)',
                          border: isTrophy ? '1.5px solid #fef08a' : '1px solid #d97706',
                          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {item.fish.image ? (
                          <img
                            src={item.fish.image}
                            alt={item.fish.name}
                            style={{
                              width: '36px',
                              height: '26px',
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))',
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '20px' }}>{item.fish.icon}</div>
                        )}
                      </div>

                      {/* Название и вес */}
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 900,
                            fontSize: '13px',
                            color: '#fef3c7',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.fish.name}
                          {isTrophy && <span style={{ marginLeft: '4px', fontSize: '11px' }}>🏆</span>}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#cbd5e1',
                            marginTop: '1px',
                            fontWeight: 700,
                          }}
                        >
                          Вес: <span style={{ color: '#38bdf8', fontWeight: 900 }}>{formatWeight(item.weight)}</span> • +{item.exp} XP
                        </div>
                      </div>
                    </div>

                    {/* Кнопка продажи рыбы */}
                    <button
                      onClick={() => {
                        triggerHaptic('impact');
                        onSellFish(itemUid, itemPrice);
                      }}
                      style={{
                        background: 'linear-gradient(180deg, #422008 0%, #2b1405 100%)',
                        border: isTrophy ? '1.5px solid #facc15' : '1px solid #d97706',
                        borderRadius: '11px',
                        padding: '6px 10px',
                        color: isTrophy ? '#fde047' : '#fbbf24',
                        fontWeight: 900,
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.45)',
                        flexShrink: 0,
                      }}
                    >
                      <span>+{itemPrice}</span>
                      <CoinIcon size={13} />
                      {isTrophy && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#7dd3fc', marginLeft: '2px' }}>
                          +5 <GemIcon size={12} />
                        </span>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
