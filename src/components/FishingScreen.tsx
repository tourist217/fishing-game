import { useEffect } from 'react';
import { BAITS } from '../baitData';
import type { CaughtFishItem } from './InventoryScreen';
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

  // Глобальная защита от залипания тяги
  useEffect(() => {
    const handleGlobalRelease = () => {
      onPullEnd();
    };

    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    window.addEventListener('touchcancel', handleGlobalRelease);
    window.addEventListener('blur', handleGlobalRelease);

    return () => {
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
      window.removeEventListener('touchcancel', handleGlobalRelease);
      window.removeEventListener('blur', handleGlobalRelease);
    };
  }, [onPullEnd]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '10px 0',
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Верхняя панель локации */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '8px 12px',
          borderRadius: '12px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <button
          onClick={onBackToHub}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          ← На базу
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{currentLocation.icon}</span>
          <span style={{ fontWeight: 'bold', fontSize: '13px', color: currentLocation.accentColor }}>
            {currentLocation.name}
          </span>
        </div>

        <button
          onClick={onOpenMap}
          style={{
            background: 'rgba(56, 189, 248, 0.2)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Карта 🗺️
        </button>
      </div>

      {/* Центральная зона анимации и шкал вываживания */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          width: '100%',
        }}
      >
        {gameState === 'idle' && (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            Насадите наживку и забросьте удочку
          </div>
        )}

        {gameState === 'waiting' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', animation: 'bounce 1.5s infinite ease-in-out' }}>
              🪱
            </div>
            <div style={{ color: '#38bdf8', marginTop: '10px', fontWeight: 'bold', fontSize: '15px' }}>
              Ожидание поклёвки...
            </div>
          </div>
        )}

        {gameState === 'hooked' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', animation: 'pulse 0.6s infinite alternate' }}>
              ❗
            </div>
            <div style={{ color: '#fbbf24', marginTop: '6px', fontWeight: 'bold', fontSize: '18px' }}>
              КЛЮЁТ! ПОДСЕКАЙ!
            </div>
          </div>
        )}

        {gameState === 'reeling' && (
          <div style={{ width: '85%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Шкала прогресса вываживания */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: '#94a3b8' }}>
                <span>Вываживание</span>
                <span>{Math.round(catchProgress)}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${catchProgress}%`,
                    height: '100%',
                    background: '#22c55e',
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
            </div>

            {/* Шкала натяжения с динамической зелёной зоной */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: '#94a3b8' }}>
                <span>Натяжение лески</span>
                <span style={{ color: tension > 80 ? '#ef4444' : tension < 20 ? '#fbbf24' : '#22c55e' }}>
                  {Math.round(tension)}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '24px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {/* Динамическая зелёная зона (плавно перемещается при рывках рыбы) */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${sweetSpotStart}%`,
                    width: `${sweetSpotEnd - sweetSpotStart}%`,
                    height: '100%',
                    background: 'rgba(34, 197, 94, 0.4)',
                    borderLeft: '2px solid #22c55e',
                    borderRight: '2px solid #22c55e',
                    transition: 'left 0.4s ease, width 0.3s ease',
                  }}
                />
                {/* Бегунок натяжения */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${tension}%`,
                    top: '2px',
                    width: '8px',
                    height: '20px',
                    borderRadius: '4px',
                    background: '#ffffff',
                    transform: 'translateX(-50%)',
                    boxShadow: '0 0 8px #ffffff',
                    transition: 'left 0.04s linear',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Выбор наживки */}
      {gameState === 'idle' && (
        <div style={{ width: '100%', marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', textAlign: 'center' }}>
            Выберите наживку:
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {BAITS.map((b) => {
              const count = baits[b.id] || 0;
              const isSelected = selectedBaitId === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBait(b.id)}
                  style={{
                    flex: '0 0 auto',
                    padding: '6px 10px',
                    borderRadius: '10px',
                    border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{b.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: isSelected ? 'bold' : 'normal' }}>
                    {b.name} ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Кнопки действия */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {gameState === 'idle' && (
          <button
            disabled={currentBaitCount <= 0}
            onClick={onStartFishing}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: currentBaitCount > 0 ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#334155',
              color: currentBaitCount > 0 ? '#fff' : '#64748b',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: currentBaitCount > 0 ? 'pointer' : 'not-allowed',
              boxShadow: currentBaitCount > 0 ? '0 4px 15px rgba(37,99,235,0.4)' : 'none',
            }}
          >
            {currentBaitCount > 0 ? 'Забросить удочку 🎣' : 'Нет наживки (купите в магазине) 🪱'}
          </button>
        )}

        {gameState === 'waiting' && (
          <button
            disabled
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: 'rgba(255,255,255,0.05)',
              color: '#94a3b8',
              fontWeight: 'bold',
              fontSize: '15px',
            }}
          >
            Ждём поклёвку... ⏳
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
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(245,158,11,0.5)',
              animation: 'pulse 0.4s infinite alternate',
            }}
          >
            ПОДСЕЧЬ! ⚡
          </button>
        )}

        {gameState === 'reeling' && (
          <button
            onPointerDown={onPullStart}
            onPointerUp={onPullEnd}
            onPointerCancel={onPullEnd}
            onTouchStart={onPullStart}
            onTouchEnd={onPullEnd}
            onTouchCancel={onPullEnd}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              width: '100%',
              padding: '20px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '18px',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'none',
              boxShadow: '0 4px 20px rgba(2,132,199,0.4)',
            }}
          >
            ТЯНУТЬ (УДЕРЖИВАЙТЕ) 🎣
          </button>
        )}
      </div>

      {/* Модалка пойманной рыбы */}
      {gameState === 'caught' && currentFish && (
        <div
          onClick={onDismissModal}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            zIndex: 50,
            cursor: canDismissModal ? 'pointer' : 'default',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>{currentFish.fish.icon}</div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              color: getRarityLabel(currentFish.fish.rarity).color,
              marginBottom: '4px',
              letterSpacing: '0.1em',
            }}
          >
            {getRarityLabel(currentFish.fish.rarity).text}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginBottom: '6px' }}>
            {currentFish.fish.name}
          </div>
          <div style={{ fontSize: '15px', color: '#38bdf8', marginBottom: '14px' }}>
            Вес: <strong>{currentFish.weight} кг</strong>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: '10px', fontSize: '13px' }}>
              +{currentFish.price} 🪙
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: '10px', fontSize: '13px' }}>
              +{currentFish.exp} XP
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {canDismissModal ? 'Нажмите в любом месте, чтобы забрать' : 'Рыба отправляется в садок...'}
          </div>
        </div>
      )}

      {/* Модалка срыва */}
      {gameState === 'lost' && (
        <div
          onClick={onDismissModal}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            zIndex: 50,
            cursor: canDismissModal ? 'pointer' : 'default',
          }}
        >
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>💨</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f87171', marginBottom: '6px' }}>
            Рыба сорвалась!
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginBottom: '20px' }}>
            Натяжение вышло из-под контроля. Удерживайте бегунок в зелёной зоне.
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {canDismissModal ? 'Нажмите в любом месте' : 'Подготовка снасти...'}
          </div>
        </div>
      )}
    </div>
  );
};