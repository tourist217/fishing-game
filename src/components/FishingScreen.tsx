import React from 'react';
import type { FishingLocation } from '../locationsData';
import type { ActiveFishState } from '../hooks/useFishingSimulation';
import { formatWeight } from '../utils/fishUtils';
import { FishingSceneCanvas } from './FishingSceneCanvas';
import { TrophyCardModal } from './TrophyCardModal';
import { CoinIcon } from './CoinIcon';

export type GameState = 'idle' | 'waiting' | 'hooked' | 'reeling' | 'caught' | 'lost' | 'line_broken';

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
  hasLineOnRod?: boolean;
  rodMaterial?: string;
  coins?: number;
  onSelectBait: (baitId: string) => void;
  onStartFishing: () => void;
  onStartReeling: () => void;
  onPullStart: () => void;
  onPullEnd: () => void;
  onDismissModal: () => void;
  onOpenMap: () => void;
  onOpenShop?: () => void;
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
  hasLineOnRod = true,
  rodMaterial = 'bamboo',
  coins: _coins,
  onSelectBait,
  onStartFishing,
  onStartReeling,
  onPullStart,
  onPullEnd,
  onDismissModal,
  onOpenMap: _onOpenMap,
  onOpenShop,
  onBackToHub: _onBackToHub,
  getRarityLabel: _getRarityLabel,
}) => {
  const currentBaitCount = baits[selectedBaitId] || 0;
  const canCast = currentBaitCount > 0 && hasLineOnRod;

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

      {/* Центральная игровая зона с 2D Canvas водоёма, удочки и поплавка */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          margin: '8px 0',
        }}
      >
        <FishingSceneCanvas
          location={currentLocation}
          gameState={gameState}
          tension={tension}
          rodMaterial={rodMaterial}
        />

        {/* Компактные информирующие бейджи сверху холста */}


        {gameState === 'hooked' && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5,
              background: 'rgba(245, 158, 11, 0.25)',
              backdropFilter: 'blur(6px)',
              padding: '4px 16px',
              borderRadius: '12px',
              border: '1px solid #f59e0b',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#fbbf24',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)',
              animation: 'pulse 0.8s infinite',
            }}
          >
            ⚡ КЛЮЁТ!
          </div>
        )}

        {gameState === 'reeling' && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 24px)',
              maxWidth: '320px',
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              padding: '10px 14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
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
                  marginBottom: '3px',
                }}
              >
                <span>Подмотка к берегу</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                  {Math.round(catchProgress)}%
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '4px',
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
                  marginBottom: '3px',
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
                  height: '20px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: '10px',
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
                    transition: 'left 0.3s ease-in-out, width 0.3s ease-in-out',
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

      {/* Единая нижняя панель управления статичной высоты (92px) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minHeight: '92px',
          justifyContent: 'flex-end',
        }}
      >
        {/* Селектор наживки (всегда одной высоты) */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px',
            opacity: gameState === 'idle' ? 1 : 0.6,
            pointerEvents: gameState === 'idle' ? 'auto' : 'none',
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
                  borderRadius: '10px',
                  padding: '5px 8px',
                  color: '#fff',
                  fontSize: '11px',
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

        {/* Главная кнопка действия (всегда занимает одинаковую нижнюю позицию) */}
        {gameState === 'idle' && (
          <button
            onClick={canCast ? onStartFishing : (!hasLineOnRod ? onOpenShop : undefined)}
            disabled={!canCast && hasLineOnRod}
            style={{
              height: '52px',
              background: canCast
                ? 'linear-gradient(180deg, #84cc16 0%, #65a30d 50%, #4d7c0f 100%)'
                : !hasLineOnRod
                ? 'linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              border: canCast
                ? '2px solid #bef264'
                : !hasLineOnRod
                ? '2px solid #fca5a5'
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              color: canCast || !hasLineOnRod ? '#ffffff' : '#64748b',
              fontSize: '15px',
              fontWeight: 900,
              cursor: canCast || !hasLineOnRod ? 'pointer' : 'not-allowed',
              boxShadow: canCast
                ? '0 0 24px rgba(132, 204, 22, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)'
                : 'none',
              letterSpacing: '0.5px',
            }}
          >
            {canCast
              ? 'ЗАБРОСИТЬ УДОЧКУ 🎣'
              : !hasLineOnRod
              ? 'НЕТ ЛЕСКИ (В МАГАЗИН) 🛒'
              : 'НЕТ НАЖИВКИ 🚫'}
          </button>
        )}

        {gameState === 'waiting' && (
          <button
            disabled
            style={{
              height: '52px',
              background: 'rgba(22, 28, 38, 0.85)',
              border: '1.5px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '24px',
              color: '#38bdf8',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'default',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)',
            }}
          >
            ОЖИДАНИЕ ПОКЛЁВКИ... 🌊
          </button>
        )}

        {gameState === 'hooked' && (
          <button
            onClick={onStartReeling}
            style={{
              height: '52px',
              background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 60%, #b45309 100%)',
              border: '2px solid #fde68a',
              borderRadius: '24px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 900,
              boxShadow: '0 0 24px rgba(245, 158, 11, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4)',
              cursor: 'pointer',
              animation: 'pulse 0.8s infinite',
            }}
          >
            ПОДСЕЧЬ! 🎣
          </button>
        )}

        {gameState === 'reeling' && (
          <button
            onMouseDown={onPullStart}
            onMouseUp={onPullEnd}
            onTouchStart={onPullStart}
            onTouchEnd={onPullEnd}
            style={{
              height: '52px',
              background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)',
              border: '2px solid #fca5a5',
              borderRadius: '24px',
              color: '#ffffff',
              fontSize: '17px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 0 24px rgba(239, 68, 68, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4)',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            ТЯНУТЬ! 🔄
          </button>
        )}
      </div>

      {/* Модальное окно поимки рыбы */}
      {gameState === 'caught' && currentFish && (
        currentFish.sizeCategory === 'trophy' ? (
          <TrophyCardModal
            currentFish={currentFish}
            canDismiss={canDismissModal}
            onDismiss={onDismissModal}
          />
        ) : (
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
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '24px',
                padding: '24px',
                width: '100%',
                maxWidth: '290px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              }}
            >
              {currentFish.fish.image ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <img
                    src={currentFish.fish.image}
                    alt={currentFish.fish.name}
                    style={{
                      width: '200px',
                      height: '130px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6))',
                    }}
                  />
                </div>
              ) : (
                <div style={{ fontSize: '64px', marginBottom: '8px' }}>
                  {currentFish.fish.icon}
                </div>
              )}

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Цена: <span style={{ color: '#fbbf24', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>+{currentFish.price} <CoinIcon size={14} /></span>
                </div>
                <div>Опыт: <span style={{ color: '#34d399', fontWeight: 'bold' }}>+{currentFish.exp} XP</span></div>
              </div>

              <div style={{ marginTop: '16px', fontSize: '11px', color: canDismissModal ? '#94a3b8' : '#64748b' }}>
                {canDismissModal ? 'Нажми в любое место, чтобы забрать' : 'Забираем в садок...'}
              </div>
            </div>
          </div>
        )
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

      {/* Модальное окно обрыва лески */}
      {gameState === 'line_broken' && (
        <div
          onClick={onDismissModal}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
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
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '290px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
            }}
          >
            <div style={{ fontSize: '56px', marginBottom: '8px' }}>💥</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
              ОБРЫВ ЛЕСКИ!
            </div>
            <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '8px', lineHeight: '1.4' }}>
              Рыба <b>{currentFish?.fish.name}</b> ({currentFish ? formatWeight(currentFish.weight) : ''}) оказалась слишком тяжелой! Леска порвана.
            </div>
            <div
              style={{
                marginTop: '14px',
                fontSize: '12px',
                color: hasLineOnRod ? '#34d399' : '#f87171',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '8px 12px',
                borderRadius: '10px',
              }}
            >
              {hasLineOnRod
                ? '✓ Экипирована следующая леска из запаса'
                : '❌ На удочке больше нет лески! Зайдите в Магазин.'}
            </div>
            {!hasLineOnRod && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenShop?.();
                }}
                style={{
                  marginTop: '14px',
                  width: '100%',
                  padding: '12px',
                  background: '#0284c7',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Купить леску в Магазине 🛒
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};