import type { CaughtFishItem } from './InventoryScreen';
import { BAITS } from '../baitData';

export type GameState = 'idle' | 'waiting' | 'hooked' | 'reeling' | 'caught' | 'lost';

interface FishingScreenProps {
  gameState: GameState;
  tension: number;
  catchProgress: number;
  sweetSpotStart: number;
  sweetSpotEnd: number;
  currentFish: CaughtFishItem | null;
  canDismissModal: boolean;
  selectedBaitId: string;
  baits: Record<string, number>;
  onSelectBait: (baitId: string) => void;
  getRarityLabel: (rarity: string) => { text: string; color: string };
  onStartFishing: () => void;
  onStartReeling: () => void;
  onPullStart: () => void;
  onPullEnd: () => void;
  onDismissModal: () => void;
}

export const FishingScreen = ({
  gameState,
  tension,
  catchProgress,
  sweetSpotStart,
  sweetSpotEnd,
  currentFish,
  canDismissModal,
  selectedBaitId,
  baits,
  onSelectBait,
  getRarityLabel,
  onStartFishing,
  onStartReeling,
  onPullStart,
  onPullEnd,
  onDismissModal,
}: FishingScreenProps) => {
  const currentBaitCount = baits[selectedBaitId] || 0;
  const hasBait = currentBaitCount > 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: '16px 0' }}>
      {/* Центральная игровая зона */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        {gameState === 'idle' && (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>🌊</div>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Выберите наживку и забросьте удочку:</p>

            {/* Выбор наживки перед забросом */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0 12px 0', justifyContent: 'center' }}>
              {BAITS.map((bait) => {
                const count = baits[bait.id] || 0;
                const isSelected = selectedBaitId === bait.id;
                return (
                  <button
                    key={bait.id}
                    onClick={() => onSelectBait(bait.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(37, 99, 235, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      cursor: 'pointer',
                      minWidth: '58px',
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>{bait.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '2px' }}>{count} шт</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'waiting' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>📍</div>
            <p style={{ color: '#38bdf8', fontWeight: 'bold' }}>Ждем поклевку...</p>
          </div>
        )}

        {gameState === 'hooked' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>💥</div>
            <h2 style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold' }}>
              КЛЮЕТ! ПОДСЕКАЙ!
            </h2>
          </div>
        )}

        {gameState === 'reeling' && (
          <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Вываживание</span>
                <span>{Math.round(catchProgress)}%</span>
              </div>
              <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '7px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${catchProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8, #22c55e)',
                    transition: 'width 0.1s ease',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Натяжение лески</span>
                <span style={{ color: tension > sweetSpotEnd || tension < sweetSpotStart ? '#ef4444' : '#22c55e' }}>
                  {tension > sweetSpotEnd ? 'Слишком сильно!' : tension < sweetSpotStart ? 'Слишком слабо!' : 'Идеально'}
                </span>
              </div>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '24px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: `${sweetSpotStart}%`,
                    width: `${sweetSpotEnd - sweetSpotStart}%`,
                    height: '100%',
                    background: 'rgba(34, 197, 94, 0.35)',
                    borderLeft: '2px dashed #22c55e',
                    borderRight: '2px dashed #22c55e',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: `${tension}%`,
                    top: '2px',
                    width: '12px',
                    height: '20px',
                    marginLeft: '-6px',
                    background: '#ffffff',
                    borderRadius: '4px',
                    boxShadow: '0 0 8px #ffffff',
                    transition: 'left 0.05s ease',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {gameState === 'caught' && currentFish && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '24px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.15)',
              width: '100%',
              maxWidth: '300px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                color: getRarityLabel(currentFish.fish.rarity).color,
                background: 'rgba(255,255,255,0.06)',
                marginBottom: '12px',
              }}
            >
              {getRarityLabel(currentFish.fish.rarity).text}
            </div>

            <div style={{ fontSize: '64px', marginBottom: '8px' }}>{currentFish.fish.icon}</div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold' }}>{currentFish.fish.name}</h3>
            <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '4px', marginBottom: '16px' }}>
              Вес: <strong style={{ color: '#ffffff' }}>{currentFish.weight} кг</strong>
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '12px',
                padding: '10px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Стоимость</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fbbf24' }}>
                  {currentFish.price} 🪙
                </div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Опыт</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#a78bfa' }}>
                  +{currentFish.exp} ⭐
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === 'lost' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>💨</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>Рыба сорвалась!</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
              Леска ослабла или оборвалась от сильного натяжения.
            </p>
          </div>
        )}
      </div>

      {/* Кнопка управления */}
      <div>
        {gameState === 'idle' && (
          <button
            disabled={!hasBait}
            onClick={onStartFishing}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: hasBait ? '#2563eb' : '#334155',
              color: hasBait ? '#ffffff' : '#64748b',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: hasBait ? 'pointer' : 'not-allowed',
            }}
          >
            {hasBait ? 'Забросить удочку 🎣' : 'Наживка закончилась 🪱'}
          </button>
        )}

        {gameState === 'hooked' && (
          <button
            onClick={onStartReeling}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ПОДСЕЧЬ! ⚡
          </button>
        )}

        {gameState === 'reeling' && (
          <button
            onMouseDown={onPullStart}
            onMouseUp={onPullEnd}
            onTouchStart={onPullStart}
            onTouchEnd={onPullEnd}
            style={{
              width: '100%',
              padding: '20px',
              borderRadius: '16px',
              border: 'none',
              background: '#059669',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ТЯНУТЬ КАТУШКУ 🌀
          </button>
        )}

        {gameState === 'caught' && (
          <button
            disabled={!canDismissModal}
            onClick={onDismissModal}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: canDismissModal ? '#38bdf8' : '#334155',
              color: canDismissModal ? '#0f172a' : '#64748b',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: canDismissModal ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            {canDismissModal ? 'Положить в садок 🧺' : 'Осматриваем рыбу...'}
          </button>
        )}

        {gameState === 'lost' && (
          <button
            disabled={!canDismissModal}
            onClick={onDismissModal}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: canDismissModal ? '#475569' : '#334155',
              color: canDismissModal ? '#ffffff' : '#64748b',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: canDismissModal ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            {canDismissModal ? 'Попробовать снова 🔄' : 'Рыба уплыла...'}
          </button>
        )}
      </div>
    </div>
  );
};