import type { Fish } from '../fishData';

export interface CaughtFishItem {
  uid: string;
  fish: Fish;
  weight: number;
  price: number;
  exp: number;
  caughtAt: number;
}

interface InventoryScreenProps {
  inventory: CaughtFishItem[];
  onSellFish: (uid: string, price: number) => void;
  onSellAll: () => void;
  getRarityLabel: (rarity: string) => { text: string; color: string };
}

export const InventoryScreen = ({
  inventory,
  onSellFish,
  onSellAll,
  getRarityLabel,
}: InventoryScreenProps) => {
  const totalValue = inventory.reduce((sum, item) => sum + item.price, 0);

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
        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>
          Садок ({inventory.length} шт.)
        </h2>
        {inventory.length > 0 && (
          <button
            onClick={onSellAll}
            style={{
              background: '#10b981',
              border: 'none',
              color: '#fff',
              borderRadius: '10px',
              padding: '8px 14px',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Продать всё (+{totalValue} 🪙)
          </button>
        )}
      </div>

      {inventory.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🧺</div>
          <div>Садок пуст. Время на рыбалку!</div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
          {inventory.map((item) => (
            <div
              key={item.uid}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '14px',
                padding: '10px 14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>{item.fish.icon}</div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{item.fish.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {item.weight} кг • <span style={{ color: getRarityLabel(item.fish.rarity).color }}>{getRarityLabel(item.fish.rarity).text}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onSellFish(item.uid, item.price)}
                style={{
                  background: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  color: '#fbbf24',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                +{item.price} 🪙
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};