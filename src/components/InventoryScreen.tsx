import type { Fish, FishSizeCategory } from '../fishData';
import { formatWeight } from '../utils/fishUtils';
import { CoinIcon } from './CoinIcon';
import { GemIcon } from './GemIcon';
import { triggerHaptic } from '../utils/haptics';

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

export const InventoryScreen = ({
  inventory,
  maxCapacity = 15,
  getRarityLabel: _getRarityLabel,
  onSellFish,
  onSellAll,
  onClose,
}: InventoryScreenProps) => {
  const totalValue = inventory.reduce((sum, item) => sum + (Number(item.price) || 1), 0);
  const trophyCount = inventory.filter((item) => item.sizeCategory === 'trophy').length;
  const capacityPercent = Math.min(100, (inventory.length / maxCapacity) * 100);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        overflow: 'hidden',
        padding: '2px 4px 6px 4px',
        maxWidth: '440px',
        width: '100%',
        margin: '0 auto',
        userSelect: 'none',
      }}
    >
      {/* Главная деревянная доска садка в тёплом медовом дубе (Вариант 1) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #3d2110 0%, #2e180b 100%)',
          borderRadius: '24px',
          border: '3px solid #85491e',
          outline: '1.5px solid #d97706',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.75), inset 0 2px 4px rgba(255, 255, 255, 0.15)',
          padding: '12px 14px',
          gap: '10px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Заголовок доски с кнопкой закрытия (X) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            paddingBottom: '2px',
          }}
        >
          {/* Резная центральная плашка названия */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(180deg, #5a3014 0%, #3e1f0b 100%)',
              border: '2px solid #b45309',
              borderRadius: '16px',
              padding: '7px 16px',
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
            }}
          >
            <span
              style={{
                color: '#fef3c7',
                fontFamily: 'Georgia, serif',
                fontWeight: 900,
                fontSize: 'clamp(16px, 3.8vw, 19px)',
                letterSpacing: '0.6px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.85)',
              }}
            >
              Садок рыбака
            </span>
          </div>

          {/* Кнопка закрытия (X) */}
          {onClose && (
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              aria-label="Закрыть"
              style={{
                marginLeft: '8px',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #d97706 0%, #92400e 100%)',
                border: '1.5px solid #fef08a',
                color: '#451a03',
                fontWeight: 900,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
                WebkitTapHighlightColor: 'transparent',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Верхняя информационная карточка: плетеная корзина + заполненность + продать всё */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(180deg, #d89650 0%, #c48340 50%, #b27332 100%)',
            border: '2px solid #5a2e10',
            borderRadius: '18px',
            padding: '9px 12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.35)',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 3D плетёная корзина */}
            <img
              src="/assets/ui/wicker_basket.png"
              alt="Садок"
              style={{
                width: '46px',
                height: '46px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))',
                flexShrink: 0,
              }}
            />

            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 900,
                  color: '#2e1405',
                  textShadow: '0 1px 1px rgba(255, 255, 255, 0.3)',
                }}
              >
                Вместимость
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 900,
                  color: inventory.length >= maxCapacity ? '#b91c1c' : '#2b1405',
                  marginTop: '1px',
                }}
              >
                {inventory.length} / {maxCapacity} рыб
              </div>
              {/* Прогресс-бар заполненности */}
              <div
                style={{
                  width: '84px',
                  height: '7px',
                  background: '#45220c',
                  borderRadius: '4px',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.8)',
                  overflow: 'hidden',
                  marginTop: '3px',
                }}
              >
                <div
                  style={{
                    width: `${capacityPercent}%`,
                    height: '100%',
                    background:
                      inventory.length >= maxCapacity
                        ? 'linear-gradient(90deg, #ef4444, #f87171)'
                        : 'linear-gradient(90deg, #22c55e, #86efac)',
                    borderRadius: '4px',
                    boxShadow: '0 0 8px rgba(74, 222, 128, 0.7)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Сочная кнопка «Продать всё» */}
          {inventory.length > 0 && (
            <button
              onClick={() => {
                triggerHaptic('notification');
                onSellAll();
              }}
              style={{
                background: 'linear-gradient(180deg, #4ade80 0%, #16a34a 60%, #15803d 100%)',
                border: '2px solid #86efac',
                borderRadius: '14px',
                padding: '9px 14px',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 'clamp(11px, 2.7vw, 13px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                WebkitTapHighlightColor: 'transparent',
                flexShrink: 0,
              }}
            >
              <span>Продать всё за {totalValue}</span>
              <CoinIcon size={16} />
              {trophyCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    color: '#fef08a',
                    marginLeft: '2px',
                  }}
                >
                  +{trophyCount * 5} <GemIcon size={14} />
                </span>
              )}
            </button>
          )}
        </div>

        {/* Список пойманных рыб на деревянных дощечках */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
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
                gap: '12px',
                padding: '40px 20px',
                background: 'rgba(20, 10, 5, 0.45)',
                borderRadius: '20px',
                border: '1.5px dashed rgba(217, 119, 6, 0.4)',
              }}
            >
              <img
                src="/assets/ui/wicker_basket.png"
                alt="Пустой садок"
                style={{
                  width: '68px',
                  height: '68px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))',
                  opacity: 0.85,
                }}
              />
              <div
                style={{
                  fontSize: '17px',
                  fontWeight: 900,
                  color: '#fef3c7',
                  fontFamily: 'Georgia, serif',
                }}
              >
                Садок сейчас пуст
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#fed7aa',
                  textAlign: 'center',
                  maxWidth: '240px',
                  lineHeight: '1.4',
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
                    background: 'linear-gradient(180deg, #d89650 0%, #c48340 50%, #b27332 100%)',
                    border: isTrophy ? '2px solid #facc15' : '1.5px solid #6b3711',
                    borderRadius: '16px',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: isTrophy
                      ? '0 0 14px rgba(250, 204, 21, 0.45), 0 3px 8px rgba(0, 0, 0, 0.35)'
                      : '0 3px 8px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    {/* Круглый резной медальон с реальной картинкой рыбы */}
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #85481d 0%, #542b0e 100%)',
                        border: isTrophy ? '2px solid #fef08a' : '2px solid #eab308',
                        boxShadow:
                          'inset 0 2px 4px rgba(0, 0, 0, 0.65), 0 2px 6px rgba(0, 0, 0, 0.35)',
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
                            width: '42px',
                            height: '32px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))',
                          }}
                        />
                      ) : (
                        <div style={{ fontSize: '26px' }}>{item.fish.icon}</div>
                      )}
                    </div>

                    {/* Название рыбы и параметры веса/опыта */}
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: '15px',
                          color: '#2e1405',
                          textShadow: '0 1px 1px rgba(255, 255, 255, 0.3)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.fish.name}
                      </div>
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: '#572b0c',
                          marginTop: '2px',
                          fontWeight: 700,
                        }}
                      >
                        Вес:{' '}
                        <span style={{ color: '#0369a1', fontWeight: 900 }}>
                          {formatWeight(item.weight)}
                        </span>{' '}
                        • +{item.exp} XP
                      </div>
                    </div>
                  </div>

                  {/* Кнопка продажи отдельной рыбы */}
                  <button
                    onClick={() => {
                      triggerHaptic('impact');
                      onSellFish(itemUid, itemPrice);
                    }}
                    style={{
                      background: 'linear-gradient(180deg, #422008 0%, #2b1405 100%)',
                      border: isTrophy ? '1.5px solid #facc15' : '1.5px solid #d97706',
                      borderRadius: '13px',
                      padding: '7px 12px',
                      color: isTrophy ? '#fde047' : '#fbbf24',
                      fontWeight: 900,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                      flexShrink: 0,
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    +{itemPrice} <CoinIcon size={14} />
                    {isTrophy && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          color: '#7dd3fc',
                        }}
                      >
                        +5 <GemIcon size={13} />
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
  );
};
