import type { Fish, FishSizeCategory } from '../fishData';

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

export const formatWeight = (kg: number): string => {
  if (kg < 1) {
    return `${Math.round(kg * 1000)} г`;
  }
  return `${kg.toFixed(2)} кг`;
};

export const getCategoryBadgeStyle = (category?: FishSizeCategory) => {
  switch (category) {
    case 'trophy':
      return {
        text: '🏆 ТРОФЕЙ',
        color: '#fbbf24',
        bg: 'rgba(251, 191, 36, 0.15)',
        border: '1px solid rgba(251, 191, 36, 0.5)',
      };
    case 'large':
      return {
        text: 'Крупная',
        color: '#a855f7',
        bg: 'rgba(168, 85, 247, 0.12)',
        border: '1px solid rgba(168, 85, 247, 0.35)',
      };
    case 'medium':
      return {
        text: 'Средняя',
        color: '#38bdf8',
        bg: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
      };
    case 'small':
    default:
      return {
        text: 'Мелкая',
        color: '#94a3b8',
        bg: 'rgba(148, 163, 184, 0.1)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      };
  }
};

export const InventoryScreen = ({
  inventory,
  getRarityLabel,
  onSellFish,
  onSellAll,
}: InventoryScreenProps) => {
  const totalValue = inventory.reduce((sum, item) => sum + (Number(item.price) || 1), 0);

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
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Рыбы в садке</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
            {inventory.length} шт.
          </div>
        </div>

        {inventory.length > 0 && (
          <button
            onClick={onSellAll}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 16px',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            Продать всё за {totalValue} 🪙
          </button>
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '4px',
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
              color: '#64748b',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '40px' }}>🕸️</span>
            <span>Садок пуст. Время на рыбалку!</span>
          </div>
        ) : (
          inventory.map((item, index) => {
            const itemPrice = Number(item.price) || 1;
            const itemUid = item.uid || `fish_${index}`;
            const rarity = getRarityLabel(item.fish.rarity);
            const badge = getCategoryBadgeStyle(item.sizeCategory);

            return (
              <div
                key={itemUid}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: item.sizeCategory === 'trophy' 
                    ? '1px solid rgba(251, 191, 36, 0.4)' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '28px' }}>{item.fish.icon}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                        {item.fish.name}
                      </span>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 'bold',
                          color: rarity.color,
                          border: `1px solid ${rarity.color}40`,
                          padding: '1px 5px',
                          borderRadius: '4px',
                        }}
                      >
                        {rarity.text}
                      </span>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 'bold',
                          color: badge.color,
                          background: badge.bg,
                          border: badge.border,
                          padding: '1px 5px',
                          borderRadius: '4px',
                        }}
                      >
                        {badge.text}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                      Вес: <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{formatWeight(item.weight)}</span> • +{item.exp} XP
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSellFish(itemUid, itemPrice)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    color: '#fbbf24',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  +{itemPrice} 🪙
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};