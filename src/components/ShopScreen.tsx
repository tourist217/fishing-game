import { RODS, type Rod } from '../shopData';

interface ShopScreenProps {
  coins: number;
  level: number;
  equippedRodId: string;
  ownedRods: string[];
  onBuyRod: (rod: Rod) => void;
  onEquipRod: (rodId: string) => void;
}

export const ShopScreen = ({
  coins,
  level,
  equippedRodId,
  ownedRods,
  onBuyRod,
  onEquipRod,
}: ShopScreenProps) => {
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
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
        Магазин снастей 🛒
      </h2>

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
    </div>
  );
};