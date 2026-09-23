import React from 'react';
import type { FishingLocation } from '../locationsData';
import type { ActiveFishState } from '../hooks/useFishingSimulation';
import { formatWeight, getCategoryBadgeStyle } from './InventoryScreen';

export type GameState = 'idle' | 'waiting' | 'hooked' | 'reeling' | 'caught' | 'lost';

interface FishingScreenProps {
  currentLocation: FishingLocation;
  gameState: GameState;
  tension: number;
  catchProgress: number;
  sweetSpotStart: number;
  sweetSpotEnd: number;
  currentFish: ActiveFishState | null;
  canDismissModal: boolean;
  selectedBaitId: string;
  baits: Record<string, number>;
  onSelectBait: (baitId: string) => void;
  onStartFishing: () => void;
  onStartReeling: () => void;
  onPullStart: () => void;
  onPullEnd: () => void;
  onDismissModal: () => void;
  onOpenMap: () => void;
  onBackToHub?: () => void;
  getRarityLabel: (rarity: string) => { text: string; color: string };
}

export const FishingScreen: React.FC<FishingScreenProps> = ({
  currentLocation,
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
  onStartFishing,
  onStartReeling,
  onPullStart,
  onPullEnd,
  onDismissModal,
  onOpenMap,
  onBackToHub,
  getRarityLabel,
}) => {
  const currentBaitCount = baits[selectedBaitId] || 0;

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '24px',
        overflow: 'hidden',
        background: currentLocation.gradient,
        border: `1px solid ${currentLocation.accentColor}30`,
        padding: '16px',
        userSelect: 'none',
      }}
    >
      {/* Верхний бар локации */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          padding: '8px 14px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{currentLocation.icon}</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
              {currentLocation.name}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              {currentLocation.description}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '6px 9px',
                cursor: 'pointer',
              }}
            >
              База 🏠
            </button>
          )}
          <button
            onClick={onOpenMap}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '6px 9px',
              cursor: 'pointer',
            }}
          >
            Карта 🗺️
          </button>
        </div>
      </div>

      {/* Центральная игровая зона */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {gameState === 'idle' && (
          <div style={{ textAlign: 'center', color: '#cbd5e1' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎣</div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>Насади наживку и забрасывай!</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              В наличии: {currentBaitCount} шт.
            </div>
          </div>
        )}

        {gameState === 'waiting' && (
          <div style={{ textAlign: 'center', color: '#38bdf8' }}>
            <div
              style={{
                fontSize: '44px',
                marginBottom: '12px',
                display: 'inline-block',
                animation: 'pulse 1.5s infinite',
              }}
            >
              🌊
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Ждём поклёвку...</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Смотри на поплавок</div>
          </div>
        )}

        {gameState === 'hooked' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '50px', marginBottom: '8px' }}>⚡</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
              КЛЮЁТ!
            </div>
            <button
              onClick={onStartReeling}
              style={{
                marginTop: '16px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                borderRadius: '14px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold',
                padding: '12px 28px',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
                cursor: 'pointer',
              }}
            >
              ПОДСЕЧЬ! 🎣
            </button>
          </div>
        )}

        {gameState === 'reeling' && (
          <div
            style={{
              width: '100%',
              maxWidth: '300px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Шкала вываживания (Прогресс) */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#94a3b8',
                  marginBottom: '4px',
                }}
              >
                <span>Подмотка к берегу</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                  {Math.round(catchProgress)}%
                </span>
              </div>
              <div
                style={{
                  height: '10px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${catchProgress}%`,
                    background: 'linear-gradient(90deg, #10b981, #34d399)',
                    transition: 'width 0.05s linear',
                  }}
                />
              </div>
            </div>

            {/* Шкала натяжения лески */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#94a3b8',
                  marginBottom: '4px',
                }}
              >
                <span>Натяжение лески</span>
                <span
                  style={{
                    color: tension > 85 ? '#ef4444' : tension < 15 ? '#ef4444' : '#38bdf8',
                    fontWeight: 'bold',
                  }}
                >
                  {Math.round(tension)}%
                </span>
              </div>

              <div
                style={{
                  height: '24px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                {/* Зелёная безопасная зона */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${sweetSpotStart}%`,
                    width: `${sweetSpotEnd - sweetSpotStart}%`,
                    background: 'rgba(16, 185, 129, 0.35)',
                    borderLeft: '2px solid #10b981',
                    borderRight: '2px solid #10b981',
                    transition: 'left 0.2s ease-out, width 0.2s ease-out',
                  }}
                />

                {/* Бегунок натяжения */}
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    bottom: '2px',
                    left: `calc(${tension}% - 5px)`,
                    width: '10px',
                    background: '#fff',
                    borderRadius: '5px',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                    transition: 'left 0.04s linear',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Нижняя панель управления */}
      {gameState === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Селектор наживки */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            {[
              { id: 'worm', name: 'Червь', icon: '🪱' },
              { id: 'maggot', name: 'Опарыш', icon: '🐛' },
              { id: 'bread', name: 'Хлеб', icon: '🍞' },
              { id: 'dough', name: 'Тесто', icon: '🥟' },
              { id: 'corn', name: 'Кукуруза', icon: '🌽' },
              { id: 'bloodworm', name: 'Мотыль', icon: '🦟' },
              { id: 'livebait', name: 'Живец', icon: '🐟' },
            ].map((b) => {
              const count = baits[b.id] || 0;
              const isSelected = selectedBaitId === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBait(b.id)}
                  style={{
                    flex: '0 0 auto',
                    background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '6px 10px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{b.icon}</span>
                  <span>{b.name}</span>
                  <span style={{ color: count > 0 ? '#38bdf8' : '#ef4444', fontWeight: 'bold' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Кнопка заброса */}
          <button
            onClick={onStartFishing}
            disabled={currentBaitCount <= 0}
            style={{
              background: currentBaitCount > 0
                ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '16px',
              color: currentBaitCount > 0 ? '#fff' : '#64748b',
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '14px',
              cursor: currentBaitCount > 0 ? 'pointer' : 'not-allowed',
              boxShadow: currentBaitCount > 0 ? '0 4px 16px rgba(2, 132, 199, 0.4)' : 'none',
            }}
          >
            {currentBaitCount > 0 ? 'ЗАБРОСИТЬ УДОЧКУ 🎣' : 'НЕТ НАЖИВКИ 🚫'}
          </button>
        </div>
      )}

      {/* Кнопка удерживания при вываживании */}
      {gameState === 'reeling' && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onMouseDown={onPullStart}
            onMouseUp={onPullEnd}
            onTouchStart={onPullStart}
            onTouchEnd={onPullEnd}
            style={{
              width: '100%',
              maxWidth: '300px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '18px',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              padding: '16px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            ТЯНУТЬ! 🔄
          </button>
        </div>
      )}

      {/* Модальное окно поимки рыбы */}
      {gameState === 'caught' && currentFish && (
        <div
          onClick={onDismissModal}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            zIndex: 10,
            cursor: canDismissModal ? 'pointer' : 'default',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: currentFish.sizeCategory === 'trophy'
                ? '2px solid #fbbf24'
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '290px',
              textAlign: 'center',
              boxShadow: currentFish.sizeCategory === 'trophy'
                ? '0 10px 30px rgba(251, 191, 36, 0.3)'
                : '0 10px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '8px' }}>
              {currentFish.fish.icon}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
              {(() => {
                const rarity = getRarityLabel(currentFish.fish.rarity);
                const badge = getCategoryBadgeStyle(currentFish.sizeCategory);
                return (
                  <>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: rarity.color,
                        border: `1px solid ${rarity.color}50`,
                        padding: '2px 6px',
                        borderRadius: '6px',
                      }}
                    >
                      {rarity.text}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: badge.color,
                        background: badge.bg,
                        border: badge.border,
                        padding: '2px 6px',
                        borderRadius: '6px',
                      }}
                    >
                      {badge.text}
                    </span>
                  </>
                );
              })()}
            </div>

            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
              {currentFish.fish.name}
            </div>

            <div style={{ fontSize: '16px', color: '#38bdf8', fontWeight: 'bold', marginTop: '6px' }}>
              {formatWeight(currentFish.weight)}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                fontSize: '13px',
              }}
            >
              <div>Цена: <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>+{currentFish.price} 🪙</span></div>
              <div>Опыт: <span style={{ color: '#34d399', fontWeight: 'bold' }}>+{currentFish.exp} XP</span></div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '11px', color: canDismissModal ? '#94a3b8' : '#64748b' }}>
              {canDismissModal ? 'Нажми в любое место, чтобы забрать' : 'Забираем в садок...'}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно схода рыбы */}
      {gameState === 'lost' && (
        <div
          onClick={onDismissModal}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            zIndex: 10,
            cursor: canDismissModal ? 'pointer' : 'default',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '280px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '56px', marginBottom: '8px' }}>💦</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
              РЫБА СОШЛА!
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
              Леска ослабла или натяжение зашкалило. Будь внимательнее к шкале!
            </div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: canDismissModal ? '#cbd5e1' : '#64748b' }}>
              {canDismissModal ? 'Нажми, чтобы продолжить' : 'Рыба уплыла...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};