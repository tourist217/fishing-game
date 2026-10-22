import React, { useEffect } from 'react';
import type { ActiveFishState } from '../hooks/useFishingSimulation';
import { formatWeight } from '../utils/fishUtils';
import { playTrophyFanfare } from '../utils/audio';
import { triggerFishHaptic } from '../utils/haptics';
import { CoinIcon } from './CoinIcon';
import { GemIcon } from './GemIcon';

interface TrophyCardModalProps {
  currentFish: ActiveFishState;
  canDismiss: boolean;
  onDismiss: () => void;
}

export const TrophyCardModal: React.FC<TrophyCardModalProps> = ({
  currentFish,
  canDismiss,
  onDismiss,
}) => {
  // При открытии трофейной карточки запускаем звук фанфар и победную вибрацию
  useEffect(() => {
    playTrophyFanfare();
    triggerFishHaptic(currentFish.weight, 'trophy', 'catch');
  }, [currentFish.weight]);

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
            background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 50%, #a16207 100%)',
            border: '2px solid #fef08a',
            padding: '4px 18px',
            borderRadius: '16px',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            boxShadow: '0 4px 16px rgba(234, 179, 8, 0.6), inset 0 1px 2px rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>👑</span>
          <span>РЕКОРДНЫЙ ТРОФЕЙ</span>
          <span>👑</span>
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

        {/* Награды с трофейным бонусом */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            marginTop: '8px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(253, 224, 71, 0.2)',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#94a3b8' }}>Цена:</span>
            <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              +{currentFish.price} <CoinIcon size={14} />
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#94a3b8' }}>Бонус:</span>
            <span style={{ color: '#38bdf8', fontWeight: 900, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              +5 <GemIcon size={14} />
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#94a3b8' }}>Опыт:</span>
            <span style={{ color: '#4ade80', fontWeight: 900, fontSize: '14px' }}>
              +{currentFish.exp} XP
            </span>
          </div>
        </div>

        {/* Сочная золотая кнопка «Забрать трофей» */}
        <button
          onClick={onDismiss}
          disabled={!canDismiss}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '13px 18px',
            borderRadius: '16px',
            border: '2px solid #fef08a',
            background: canDismiss
              ? 'linear-gradient(180deg, #facc15 0%, #eab308 50%, #ca8a04 100%)'
              : 'rgba(51, 65, 85, 0.7)',
            color: canDismiss ? '#1c1917' : '#94a3b8',
            fontWeight: 900,
            fontSize: '15px',
            cursor: canDismiss ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: canDismiss
              ? '0 0 24px rgba(250, 204, 21, 0.6), 0 4px 12px rgba(0, 0, 0, 0.5)'
              : 'none',
            transition: 'all 0.18s ease',
          }}
        >
          <span>🧺</span>
          <span>{canDismiss ? 'Забрать трофей в садок' : 'Фиксируем трофей...'}</span>
        </button>
      </div>
    </div>
  );
};
