import type { CaughtFishItem } from './InventoryScreen';
import { BAITS } from '../baitData';
import type { FishingLocation } from '../locationsData';

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
  currentLocation: FishingLocation;
  onBackToHub: () => void;
  onOpenMap: () => void;
  onSelectBait: (id: string) => void;
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
  currentLocation,
  onBackToHub,
  onOpenMap,
  onSelectBait,
  getRarityLabel,
  onStartFishing,
  onStartReeling,
  onPullStart,
  onPullEnd,
  onDismissModal,
}: FishingScreenProps) => {
  const currentBaitCount = baits[selectedBaitId] || 0;
  const inSweetSpot = tension >= sweetSpotStart && tension <= sweetSpotEnd;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '12px 0',
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Верхняя панель локации с кнопкой выхода в меню */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '14px',
          padding: '8px 12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <button
          onClick={onBackToHub}
          disabled={gameState !== 'idle'}
          style={{
            padding: '6px 10px',
            background: gameState === 'idle' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)',
            border: 'none',
            borderRadius: '8px',
            color: gameState === 'idle' ? '#fff' : '#64748b',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: gameState === 'idle' ? 'pointer' : 'not-allowed',
          }}
        >
          ← База
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
          <span style={{ fontSize: '20px' }}>{currentLocation.icon}</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '13px', color: currentLocation.accentColor }}>
              {currentLocation.name}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              Вес: x{currentLocation.weightModifier}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenMap}
          disabled={gameState !== 'idle'}
          style={{
            padding: '6px 10px',
            background: gameState === 'idle' ? '#2563eb' : 'rgba(255, 255, 255, 0.04)',
            border: 'none',
            borderRadius: '8px',
            color: gameState === 'idle' ? '#fff' : '#64748b',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: gameState === 'idle' ? 'pointer' : 'not-allowed',
          }}
        >
          Карта 🗺️
        </button>
      </div>

      {/* Центральная игровая зона */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
        }}
      >
        {gameState === 'idle' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '8px' }}>🪣</div>
            <div style={{ color: '#94a3b8', fontSize: '13px' }}>Выберите наживку и забросьте снасть</div>
          </div>
        )}

        {gameState === 'waiting' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', animation: 'bounce 1.5s infinite' }}>🌊</div>
            <div style={{ color: '#38bdf8', fontSize: '14px', fontWeight: 'bold', marginTop: '8px' }}>
              Поплавок на воде... ждём поклёвку
            </div>
          </div>
        )}

        {gameState === 'hooked' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px' }}>❗</div>
            <div style={{ color: '#fbbf24', fontSize: '16px', fontWeight: 'bold' }}>КЛЮЁТ! ПОДСЕКАЙ!</div>
          </div>
        )}

        {gameState === 'reeling' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Смотка лески:</span>
                <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{Math.round(catchProgress)}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${catchProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8, #22c55e)',
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Натяжение лески:</span>
                <span style={{ fontWeight: 'bold', color: inSweetSpot ? '#4ade80' : '#ef4444' }}>
                  {Math.round(tension)}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '16px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: `${sweetSpotStart}%`,
                    width: `${sweetSpotEnd - sweetSpotStart}%`,
                    height: '100%',
                    background: 'rgba(34, 197, 94, 0.4)',
                    borderLeft: '1px solid #22c55e',
                    borderRight: '1px solid #22c55e',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: `${tension}%`,
                    top: '0',
                    width: '6px',
                    height: '100%',
                    background: '#ffffff',
                    transform: 'translateX(-50%)',
                    borderRadius: '3px',
                    boxShadow: '0 0 6px rgba(255,255,255,0.8)',
                    transition: 'left 0.05s linear',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Выбор насадки */}
      {gameState === 'idle' && (
        <div style={{ width: '100%', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Наживка:</div>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {BAITS.map((bait) => {
              const count = baits[bait.id] || 0;
              const isSelected = selectedBaitId === bait.id;
              return (
                <button
                  key={bait.id}
                  onClick={() => onSelectBait(bait.id)}
                  style={{
                    flex: '0 0 auto',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255,255,255,0.05)',
                    border: isSelected ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{bait.icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{bait.name}</span>
                  <span style={{ fontSize: '10px', color: count > 0 ? '#38bdf8' : '#ef4444' }}>
                    {count} шт.
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Интерактивная кнопка */}
      <div style={{ width: '100%' }}>
        {gameState === 'idle' && (
          <button
            disabled={currentBaitCount <= 0}
            onClick={onStartFishing}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: currentBaitCount > 0 ? '#2563eb' : '#334155',
              color: currentBaitCount > 0 ? '#fff' : '#64748b',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: currentBaitCount > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            {currentBaitCount > 0 ? 'Забросить удочку 🎣' : 'Нет выбранной наживки!'}
          </button>
        )}

        {gameState === 'waiting' && (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '14px' }}>
            Следим за поплавком...
          </div>
        )}

        {gameState === 'hooked' && (
          <button
            onClick={onStartReeling}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: '#eab308',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              animation: 'pulse 1s infinite',
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
              padding: '18px',
              borderRadius: '12px',
              border: 'none',
              background: inSweetSpot ? '#16a34a' : '#dc2626',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            ТЯНУТЬ (ДЕРЖИ В ЗЕЛЁНОЙ ЗОНЕ!)
          </button>
        )}
      </div>

      {/* Модальное окно результата */}
      {(gameState === 'caught' || gameState === 'lost') && (
        <div
          onClick={onDismissModal}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '16px',
            padding: '20px',
            zIndex: 50,
          }}
        >
          {gameState === 'caught' && currentFish && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '56px' }}>{currentFish.fish.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: getRarityLabel(currentFish.fish.rarity).color }}>
                {getRarityLabel(currentFish.fish.rarity).text}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{currentFish.fish.name}</div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Вес: {currentFish.weight} кг</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '6px' }}>
                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>+{currentFish.price} 🪙</span>
                <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>+{currentFish.exp} ⭐</span>
              </div>
            </div>
          )}

          {gameState === 'lost' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '56px' }}>💥</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>Срыв или обрыв снасти!</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Рыба оказалась сильнее, или леска вышла за пределы шкалы.
              </div>
            </div>
          )}

          {canDismissModal && (
            <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
              Нажмите в любом месте, чтобы продолжить
            </div>
          )}
        </div>
      )}
    </div>
  );
};