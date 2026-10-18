import type { Fish, FishSizeCategory } from '../fishData';
import { formatWeight } from '../utils/fishUtils';
import { CoinIcon } from './CoinIcon';

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
  getRarityLabel: (rarity: string) => { text: string; color: string };
  onSellFish: (uid: string, price: number) => void;
  onSellAll: () => void;
}



export const InventoryScreen = ({
  inventory,
  getRarityLabel,
  onSellFish,
  onSellAll,
}: InventoryScreenProps) => {
  const totalValue = inventory.reduce((sum, item) => sum + (Number(item.price) || 1), 0);
  const maxCapacity = 15;
  const capacityPercent = Math.min(100, (inventory.length / maxCapacity) * 100);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        overflow: 'hidden',
        paddingBottom: '2px',
      }}
    >
      {/* Верхняя информационная карточка садка в стиле дизайн-системы */}
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
              width: '42px',
              height: '42px',
              borderRadius: '13px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
          >
            🧺
          </div>

          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
              Садок рыбака
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: inventory.length >= maxCapacity ? '#ef4444' : '#4ade80',
                }}
              >
                {inventory.length} / {maxCapacity} рыб
              </span>
              <div
                style={{
                  width: '60px',
                  height: '4.5px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${capacityPercent}%`,
                    height: '100%',
                    background:
                      inventory.length >= maxCapacity
                        ? 'linear-gradient(90deg, #ef4444, #f87171)'
                        : 'linear-gradient(90deg, #10b981, #4ade80)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {inventory.length > 0 && (
          <button
            onClick={onSellAll}
            style={{
              background: 'linear-gradient(180deg, #84cc16 0%, #65a30d 50%, #4d7c0f 100%)',
              border: '2px solid #bef264',
              borderRadius: '18px',
              padding: '9px 14px',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 16px rgba(132, 204, 22, 0.45), 0 4px 12px rgba(0, 0, 0, 0.4)',
              transition: 'transform 0.1s ease',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Продать всё за {totalValue} <CoinIcon size={16} />
            </span>
          </button>
        )}
      </div>

      {/* Список пойманных рыб */}
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
              color: '#94a3b8',
              gap: '10px',
              padding: '40px 20px',
              background: 'rgba(22, 28, 38, 0.5)',
              borderRadius: '24px',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
            }}
          >
            <span style={{ fontSize: '48px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
              🧺
            </span>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
              Садок сейчас пуст
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', maxWidth: '240px' }}>
              Отправляйтесь на водоём, выберите наживку и сделайте первый заброс!
            </div>
          </div>
        ) : (
          inventory.map((item, index) => {
            const itemPrice = Number(item.price) || 1;
            const itemUid = item.uid || `fish_${index}`;
            const rarity = getRarityLabel(item.fish.rarity);

            return (
              <div
                key={itemUid}
                style={{
                  background: 'rgba(22, 28, 38, 0.82)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border:
                    item.sizeCategory === 'trophy'
                      ? '1.5px solid rgba(251, 191, 36, 0.55)'
                      : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '18px',
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow:
                    item.sizeCategory === 'trophy'
                      ? '0 4px 18px rgba(251, 191, 36, 0.18)'
                      : '0 4px 16px rgba(0, 0, 0, 0.35)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Квадратный слот с рыбой */}
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                      border: `1.5px solid ${rarity.color}60`,
                      boxShadow: `0 0 10px ${rarity.color}25, inset 0 1px 3px rgba(255, 255, 255, 0.1)`,
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
                          width: '44px',
                          height: '34px',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: '28px' }}>{item.fish.icon}</div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#ffffff' }}>
                      {item.fish.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                      Вес: <span style={{ color: '#38bdf8', fontWeight: 800 }}>{formatWeight(item.weight)}</span> • +{item.exp} XP
                    </div>
                  </div>
                </div>

                {/* Кнопка продажи рыбы */}
                <button
                  onClick={() => onSellFish(itemUid, itemPrice)}
                  style={{
                    background: 'rgba(245, 158, 11, 0.16)',
                    border: '1.5px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: '13px',
                    padding: '7px 11px',
                    color: '#fbbf24',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
                    flexShrink: 0,
                  }}
                >
                  +{itemPrice} <CoinIcon size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};