import React, { useState, useEffect } from 'react';
import type { FishingLocation } from '../locationsData';
import type { ActiveFishState } from '../hooks/useFishingSimulation';
import { formatWeight } from '../utils/fishUtils';
import { FishingSceneCanvas } from './FishingSceneCanvas';
import { TrophyCardModal } from './TrophyCardModal';
import { AVAILABLE_BAITS } from '../hooks/useBaitState';
import { QuickEnergyModal } from './QuickEnergyModal';
import type { DailyProvisionsState } from '../data/provisionsData';
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
  playerLevel?: number;
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
  onOpenKeepnet?: () => void;
  onBackToHub?: () => void;
  inventoryCount?: number;
  maxKeepnetCapacity?: number;
  energy?: number;
  maxEnergy?: number;
  secondsToNextEnergy?: number;
  gems?: number;
  dailyProvisions?: DailyProvisionsState;
  onBuyProvision?: (id: 'tea' | 'sandwich') => boolean;
  onBuyEnergyWithGems?: () => boolean;
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
  playerLevel = 1,
  hasLineOnRod = true,
  rodMaterial = 'bamboo',
  coins = 0,
  gems = 0,
  energy = 100,
  maxEnergy = 100,
  secondsToNextEnergy = 0,
  dailyProvisions,
  onBuyProvision,
  onBuyEnergyWithGems,
  onSelectBait,
  onStartFishing,
  onStartReeling,
  onPullStart,
  onPullEnd,
  onDismissModal,
  onOpenMap: _onOpenMap,
  onOpenShop,
  onOpenKeepnet,
  onBackToHub: _onBackToHub,
  inventoryCount = 0,
  maxKeepnetCapacity = 15,
  getRarityLabel: _getRarityLabel,
}: FishingScreenProps) => {
  const [isEnergyModalOpen, setIsEnergyModalOpen] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const currentBaitCount = baits[selectedBaitId] || 0;
  const isKeepnetFull = inventoryCount >= maxKeepnetCapacity;
  const hasEnoughEnergy = energy >= 5;
  const canCast = currentBaitCount > 0 && hasLineOnRod && !isKeepnetFull && hasEnoughEnergy;

  const handlePullStart = (e?: React.SyntheticEvent) => {
    if (e && e.cancelable) e.preventDefault();
    setIsPulling(true);
    onPullStart();
  };

  const handlePullEnd = (e?: React.SyntheticEvent) => {
    if (e && e.cancelable) e.preventDefault();
    setIsPulling(false);
    onPullEnd();
  };

  // Сброс удержания при смене состояния
  useEffect(() => {
    if (gameState !== 'reeling' && isPulling) {
      setIsPulling(false);
      onPullEnd();
    }
  }, [gameState, isPulling, onPullEnd]);

  // Глобальный слушатель отпускания мыши/пальца для предотвращения залипания
  useEffect(() => {
    if (!isPulling) return;
    const handleGlobalEnd = () => {
      setIsPulling(false);
      onPullEnd();
    };
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchend', handleGlobalEnd);
    window.addEventListener('touchcancel', handleGlobalEnd);
    return () => {
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchend', handleGlobalEnd);
      window.removeEventListener('touchcancel', handleGlobalEnd);
    };
  }, [isPulling, onPullEnd]);

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
      <style>{`
        @keyframes reelSpoolSpin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes reelKnobSpin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes pullButtonJitter {
          0% { transform: scale(0.96) translate(0, 1px); }
          25% { transform: scale(0.96) translate(-0.4px, 1.4px); }
          50% { transform: scale(0.96) translate(0.4px, 0.8px); }
          75% { transform: scale(0.96) translate(-0.3px, 1.2px); }
          100% { transform: scale(0.96) translate(0, 1px); }
        }
      `}</style>

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

        {/* Компактный индикатор энергии на водоеме */}
        <div
          onClick={() => setIsEnergyModalOpen(true)}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            borderRadius: '16px',
            padding: '4px 8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(6px)',
          }}
          title="Пополнить энергию ☕"
        >
          <span style={{ fontSize: '12px' }}>⚡</span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24' }}>
            {energy}/{maxEnergy}
          </span>
        </div>


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
          {AVAILABLE_BAITS.filter((b) => (b.levelReq || 1) <= playerLevel || (baits[b.id] || 0) > 0).map((b) => {
            const count = baits[b.id] || 0;
            const isSelected = selectedBaitId === b.id;
            return (
              <button
                key={b.id}
                onClick={() => onSelectBait(b.id)}
                style={{
                  flex: '0 0 auto',
                  background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(0, 0, 0, 0.4)',
                  border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '4px 8px',
                  color: '#fff',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <img
                    src={b.image}
                    alt={b.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
                <span style={{ fontWeight: 700 }}>{b.name}</span>
                <span style={{ color: count > 0 ? '#38bdf8' : '#ef4444', fontWeight: 800 }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Главная кнопка действия (всегда занимает одинаковую нижнюю позицию) */}
        {gameState === 'idle' && (
          <button
            onClick={
              canCast
                ? onStartFishing
                : !hasEnoughEnergy
                ? () => setIsEnergyModalOpen(true)
                : isKeepnetFull
                ? onOpenKeepnet
                : !hasLineOnRod
                ? onOpenShop
                : undefined
            }
            disabled={!canCast && hasLineOnRod && !isKeepnetFull && hasEnoughEnergy}
            style={{
              height: '52px',
              background: canCast
                ? 'linear-gradient(180deg, #84cc16 0%, #65a30d 50%, #4d7c0f 100%)'
                : !hasEnoughEnergy
                ? 'linear-gradient(180deg, #d97706 0%, #b45309 50%, #78350f 100%)'
                : isKeepnetFull
                ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 50%, #b45309 100%)'
                : !hasLineOnRod
                ? 'linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              border: canCast
                ? '2px solid #bef264'
                : !hasEnoughEnergy
                ? '2px solid #fbbf24'
                : isKeepnetFull
                ? '2px solid #fde047'
                : !hasLineOnRod
                ? '2px solid #fca5a5'
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              color: canCast || !hasEnoughEnergy || isKeepnetFull || !hasLineOnRod ? '#ffffff' : '#64748b',
              fontSize: '15px',
              fontWeight: 900,
              cursor: canCast || !hasEnoughEnergy || isKeepnetFull || !hasLineOnRod ? 'pointer' : 'not-allowed',
              boxShadow: canCast
                ? '0 0 24px rgba(132, 204, 22, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)'
                : !hasEnoughEnergy
                ? '0 0 24px rgba(251, 191, 36, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)'
                : isKeepnetFull
                ? '0 0 24px rgba(245, 158, 11, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)'
                : 'none',
              letterSpacing: '0.5px',
            }}
          >
            {canCast
              ? 'ЗАБРОСИТЬ УДОЧКУ 🎣'
              : !hasEnoughEnergy
              ? '⚡ МАЛО ЭНЕРГИИ (ПОДКРЕПИТЬСЯ ☕)'
              : isKeepnetFull
              ? 'САДОК ПОЛОН (ПРОДАТЬ В САДКЕ 🧺)'
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '60px',
            }}
          >
            <button
              onMouseDown={handlePullStart}
              onMouseUp={handlePullEnd}
              onTouchStart={handlePullStart}
              onTouchEnd={handlePullEnd}
              onMouseLeave={() => {
                if (isPulling) handlePullEnd();
              }}
              style={{
                position: 'relative',
                height: '60px',
                width: 'auto',
                aspectRatio: '1211 / 513',
                maxWidth: '100%',
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
                animation: isPulling ? 'pullButtonJitter 0.15s infinite linear' : 'none',
                transform: isPulling ? 'scale(0.96) translateY(2px)' : 'scale(1)',
                filter: isPulling
                  ? 'drop-shadow(0 0 22px rgba(245, 158, 11, 0.9)) brightness(1.08)'
                  : 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.55))',
                transition: isPulling ? 'none' : 'transform 0.1s ease, filter 0.1s ease',
              }}
              title="Зажмите и удерживайте, чтобы тянуть леску"
            >
              <img
                src="/assets/ui/btn_pull_reel.png"
                alt="ТЯНУТЬ!"
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />

              {/* Анимация крутящейся катушки при удержании */}
              <div
                style={{
                  position: 'absolute',
                  left: '19.3%',
                  top: '52.5%',
                  width: '42px',
                  height: '42px',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  opacity: isPulling ? 1 : 0,
                  transition: 'opacity 0.12s ease',
                  mixBlendMode: 'screen',
                }}
              >
                {/* Анизотропный вращающийся золотистый блик */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background:
                      'conic-gradient(from 0deg, rgba(255, 235, 170, 0.85) 0deg, transparent 40deg, rgba(255, 215, 100, 0.95) 90deg, transparent 130deg, rgba(255, 235, 170, 0.85) 180deg, transparent 220deg, rgba(255, 215, 100, 0.95) 270deg, transparent 310deg, rgba(255, 235, 170, 0.85) 360deg)',
                    animation: isPulling ? 'reelSpoolSpin 0.24s linear infinite' : 'none',
                    filter: 'blur(1px)',
                  }}
                />
                {/* Внутренние кольца шпули с обратным вращением */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: '1.5px dashed rgba(253, 224, 71, 0.75)',
                    boxShadow: 'inset 0 0 6px rgba(245, 158, 11, 0.6)',
                    animation: isPulling ? 'reelSpoolSpin 0.18s linear infinite reverse' : 'none',
                  }}
                />
                {/* Вращающаяся рукоять катушки */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '32px',
                    height: '32px',
                    pointerEvents: 'none',
                    animation: isPulling ? 'reelKnobSpin 0.24s linear infinite' : 'none',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background:
                        'radial-gradient(circle at 35% 35%, #ffffff 0%, #fbbf24 60%, #b45309 100%)',
                      boxShadow: '0 0 4px rgba(251, 191, 36, 0.9)',
                    }}
                  />
                </div>
              </div>
            </button>
          </div>
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
      {/* Окно быстрой провизии на водоёме */}
      {isEnergyModalOpen && onBuyProvision && (
        <QuickEnergyModal
          onClose={() => setIsEnergyModalOpen(false)}
          energy={energy}
          maxEnergy={maxEnergy}
          secondsToNextEnergy={secondsToNextEnergy}
          coins={coins}
          gems={gems}
          dailyProvisions={dailyProvisions}
          onBuyProvision={onBuyProvision}
          onBuyEnergyWithGems={onBuyEnergyWithGems}
        />
      )}
    </div>
  );
};