import React, { useState, useEffect } from 'react';
import type { ActiveFishState } from '../hooks/useFishingSimulation';
import { formatWeight } from '../utils/fishUtils';
import { playTrophyFanfare } from '../utils/audio';
import { triggerFishHaptic, triggerHaptic } from '../utils/haptics';
import { CoinIcon } from './CoinIcon';
import {
  getRemainingDailyShares,
  recordShareClaim,
  shareTrophyFish,
  MAX_DAILY_SHARES,
  SHARE_COIN_REWARD,
  SHARE_ENERGY_REWARD,
} from '../utils/telegramShare';

interface TrophyCardModalProps {
  currentFish: ActiveFishState;
  canDismiss: boolean;
  onDismiss: () => void;
  onClaimShareReward?: (type: 'coins' | 'energy', amount: number) => void;
}

export const TrophyCardModal: React.FC<TrophyCardModalProps> = ({
  currentFish,
  canDismiss,
  onDismiss,
  onClaimShareReward,
}) => {
  const [shareStep, setShareStep] = useState<'initial' | 'mode_select' | 'reward_select' | 'claimed'>('initial');
  const [remainingShares, setRemainingShares] = useState<number>(() => getRemainingDailyShares());
  const [claimedReward, setClaimedReward] = useState<'coins' | 'energy' | null>(null);

  const isLegendary = currentFish.sizeCategory === 'legendary';

  // При открытии трофейной карточки запускаем звук фанфар и победную вибрацию
  useEffect(() => {
    playTrophyFanfare();
    triggerFishHaptic(currentFish.weight, 'trophy', 'catch');
  }, [currentFish.weight]);

  const handleShareClick = (mode: 'story' | 'message') => {
    triggerHaptic?.('selection');
    shareTrophyFish(currentFish, mode);
    if (remainingShares > 0) {
      setShareStep('reward_select');
    } else {
      setShareStep('claimed');
    }
  };

  const handleClaimReward = (type: 'coins' | 'energy') => {
    triggerHaptic?.('notification');
    const recorded = recordShareClaim();
    if (recorded) {
      const amount = type === 'coins' ? SHARE_COIN_REWARD : SHARE_ENERGY_REWARD;
      onClaimShareReward?.(type, amount);
      setRemainingShares(getRemainingDailyShares());
      setClaimedReward(type);
      setShareStep('claimed');
    }
  };

  return (
    <div
      onClick={canDismiss ? onDismiss : undefined}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        background: 'radial-gradient(circle at center, rgba(30, 22, 5, 0.92) 0%, rgba(5, 5, 10, 0.96) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        overflow: 'hidden',
        cursor: canDismiss ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes sunburstRotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes trophyFloat {
          0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 12px 24px rgba(250, 204, 21, 0.45)); }
          50% { transform: translateY(-8px) scale(1.03); filter: drop-shadow(0 18px 32px rgba(250, 204, 21, 0.7)); }
        }
        @keyframes pulseGoldGlow {
          0%, 100% { box-shadow: 0 0 25px rgba(250, 204, 21, 0.5), inset 0 0 20px rgba(250, 204, 21, 0.2); }
          50% { box-shadow: 0 0 45px rgba(250, 204, 21, 0.85), inset 0 0 35px rgba(250, 204, 21, 0.4); }
        }
        @keyframes sparkleDrift {
          0% { opacity: 0; transform: translateY(0) scale(0.6); }
          50% { opacity: 1; transform: translateY(-20px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.4); }
        }
      `}</style>

      {/* Вращающиеся золотые солнечные лучи на фоне */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '520px',
          height: '520px',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          animation: 'sunburstRotate 28s linear infinite',
          opacity: 0.35,
        }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <defs>
            <radialGradient id="sunburstGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ca8a04" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <polygon
              key={deg}
              points="100,100 88,0 112,0"
              fill="url(#sunburstGrad)"
              transform={`rotate(${deg} 100 100)`}
            />
          ))}
        </svg>
      </div>

      {/* Летающие золотые искры */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[
          { top: '25%', left: '20%', delay: '0s' },
          { top: '35%', left: '80%', delay: '0.4s' },
          { top: '65%', left: '15%', delay: '0.8s' },
          { top: '70%', left: '85%', delay: '1.2s' },
          { top: '20%', left: '60%', delay: '1.6s' },
        ].map((spark, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: spark.top,
              left: spark.left,
              fontSize: '18px',
              animation: `sparkleDrift 2.2s infinite ease-out ${spark.delay}`,
            }}
          >
            ✨
          </div>
        ))}
      </div>

      {/* Основная чеканная золотая карточка трофея */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '320px',
          background: 'linear-gradient(180deg, #1e1b18 0%, #17130e 100%)',
          borderRadius: '26px',
          padding: '24px 20px 20px 20px',
          border: '2.5px solid #fde047',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          animation: 'pulseGoldGlow 3s infinite ease-in-out',
          zIndex: 10,
        }}
      >
        {/* Верхняя лента с трофейной печатью */}
        <div
          style={{
            position: 'absolute',
            top: '-18px',
            background: isLegendary
              ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #9f1239 100%)'
              : 'linear-gradient(135deg, #eab308 0%, #ca8a04 50%, #a16207 100%)',
            border: isLegendary ? '2px solid #fda4af' : '2px solid #fef08a',
            padding: '4px 18px',
            borderRadius: '16px',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            boxShadow: isLegendary
              ? '0 4px 16px rgba(225, 29, 72, 0.6), inset 0 1px 2px rgba(255,255,255,0.6)'
              : '0 4px 16px rgba(234, 179, 8, 0.6), inset 0 1px 2px rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>{isLegendary ? '👑' : '🏆'}</span>
          <span>{isLegendary ? 'РЕКОРД ВИДА (ЛЕГЕНДА)' : 'РЕКОРДНЫЙ ТРОФЕЙ'}</span>
          <span>{isLegendary ? '👑' : '🏆'}</span>
        </div>

        {/* Изображение трофейной рыбы */}
        <div
          style={{
            width: '100%',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '12px',
            marginBottom: '8px',
            position: 'relative',
          }}
        >
          {/* Свечение за рыбой */}
          <div
            style={{
              position: 'absolute',
              width: '180px',
              height: '90px',
              background: 'radial-gradient(ellipse at center, rgba(250, 204, 21, 0.4) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          {currentFish.fish.image ? (
            <img
              src={currentFish.fish.image}
              alt={currentFish.fish.name}
              style={{
                maxWidth: '220px',
                maxHeight: '135px',
                objectFit: 'contain',
                animation: 'trophyFloat 3s infinite ease-in-out',
                position: 'relative',
                zIndex: 2,
              }}
            />
          ) : (
            <div
              style={{
                fontSize: '76px',
                animation: 'trophyFloat 3s infinite ease-in-out',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {currentFish.fish.icon}
            </div>
          )}
        </div>

        {/* Название рыбы */}
        <div
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '0.5px',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          {currentFish.fish.name}
        </div>

        {/* Огромный золотой вес */}
        <div
          style={{
            margin: '8px 0',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.22) 0%, rgba(202, 138, 4, 0.1) 100%)',
            border: '1.5px solid rgba(253, 224, 71, 0.55)',
            borderRadius: '16px',
            padding: '6px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '18px' }}>⚖️</span>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 900,
              color: '#fde047',
              textShadow: '0 0 12px rgba(253, 224, 71, 0.6)',
            }}
          >
            {formatWeight(currentFish.weight)}
          </span>
        </div>

        {/* Награды (Монеты и Опыт) */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            marginTop: '8px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(253, 224, 71, 0.2)',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#94a3b8' }}>Цена:</span>
            <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              +{currentFish.price} <CoinIcon size={14} />
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#94a3b8' }}>Опыт:</span>
            <span style={{ color: '#4ade80', fontWeight: 900, fontSize: '14.5px' }}>
              +{currentFish.exp} XP
            </span>
          </div>
        </div>

        {/* Блок шеринга в Telegram с наградой */}
        <div
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '10px 12px',
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '16px',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {shareStep === 'initial' && (
            <>
              <button
                onClick={() => setShareStep('mode_select')}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.45)',
                  transition: 'transform 0.1s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span>✈️</span>
                <span>Поделиться уловом</span>
              </button>
              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {remainingShares > 0 ? (
                  <>
                    <span>Награда: <strong style={{ color: '#fde047' }}>+10 🪙</strong> или <strong style={{ color: '#38bdf8' }}>+10 ⚡</strong></span>
                    <span style={{ color: '#38bdf8', fontWeight: 800 }}>({remainingShares}/{MAX_DAILY_SHARES})</span>
                  </>
                ) : (
                  <span style={{ color: '#64748b' }}>Дневной лимит наград исчерпан ({MAX_DAILY_SHARES}/{MAX_DAILY_SHARES})</span>
                )}
              </div>
            </>
          )}

          {shareStep === 'mode_select' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#e2e8f0', marginBottom: '2px' }}>
                Куда отправить улов?
              </div>
              <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                <button
                  onClick={() => handleShareClick('story')}
                  style={{
                    flex: 1,
                    padding: '8px 6px',
                    borderRadius: '10px',
                    border: '1px solid rgba(56, 189, 248, 0.5)',
                    background: 'rgba(14, 165, 233, 0.25)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span>📱</span>
                  <span>В историю</span>
                </button>
                <button
                  onClick={() => handleShareClick('message')}
                  style={{
                    flex: 1,
                    padding: '8px 6px',
                    borderRadius: '10px',
                    border: '1px solid rgba(56, 189, 248, 0.5)',
                    background: 'rgba(14, 165, 233, 0.25)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span>💬</span>
                  <span>Другу в чат</span>
                </button>
              </div>
            </div>
          )}

          {shareStep === 'reward_select' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#fef08a' }}>
                🎁 Выберите награду за шеринг:
              </div>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button
                  onClick={() => handleClaimReward('coins')}
                  style={{
                    flex: 1,
                    padding: '9px 6px',
                    borderRadius: '12px',
                    border: '1.5px solid #fbbf24',
                    background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.5)',
                  }}
                >
                  <span>+10</span>
                  <CoinIcon size={14} />
                </button>
                <button
                  onClick={() => handleClaimReward('energy')}
                  style={{
                    flex: 1,
                    padding: '9px 6px',
                    borderRadius: '12px',
                    border: '1.5px solid #38bdf8',
                    background: 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.5)',
                  }}
                >
                  <span>+10 ⚡</span>
                </button>
              </div>
            </div>
          )}

          {shareStep === 'claimed' && (
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>✅</span>
              <span>
                {claimedReward === 'coins' && 'Получено: +10 монет 🪙!'}
                {claimedReward === 'energy' && 'Получено: +10 энергии ⚡!'}
                {!claimedReward && 'Вы поделились уловом!'}
              </span>
            </div>
          )}
        </div>

        {/* Сочная золотая кнопка «Забрать трофей» */}
        <button
          onClick={onDismiss}
          disabled={!canDismiss}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '12px 18px',
            borderRadius: '16px',
            border: isLegendary ? '2px solid #fda4af' : '2px solid #fef08a',
            background: canDismiss
              ? isLegendary
                ? 'linear-gradient(180deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)'
                : 'linear-gradient(180deg, #facc15 0%, #eab308 50%, #ca8a04 100%)'
              : 'rgba(51, 65, 85, 0.7)',
            color: canDismiss ? '#ffffff' : '#94a3b8',
            fontWeight: 900,
            fontSize: '14.5px',
            cursor: canDismiss ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: canDismiss
              ? isLegendary
                ? '0 0 24px rgba(225, 29, 72, 0.6), 0 4px 12px rgba(0, 0, 0, 0.5)'
                : '0 0 24px rgba(250, 204, 21, 0.6), 0 4px 12px rgba(0, 0, 0, 0.5)'
              : 'none',
            transition: 'all 0.18s ease',
          }}
        >
          <span>🧺</span>
          <span>
            {canDismiss
              ? isLegendary
                ? 'Забрать легенду в садок'
                : 'Забрать трофей в садок'
              : 'Фиксируем улов...'}
          </span>
        </button>
      </div>
    </div>
  );
};
