import React from 'react';
import { PROVISIONS } from '../data/provisionsData';
import { CoinIcon } from './CoinIcon';
import { EnergyIcon } from './EnergyIcon';

interface QuickEnergyModalProps {
  onClose: () => void;
  energy: number;
  maxEnergy: number;
  secondsToNextEnergy: number;
  coins: number;
  onBuyProvision: (id: 'tea' | 'sandwich') => boolean;
}

// Угловые верёвки и латунные заклёпки (в едином стиле с меню наживок)
const CornerRope = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const rot = position === 'tl' ? 0 : position === 'tr' ? 90 : position === 'br' ? 180 : 270;
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 46 46"
      style={{
        position: 'absolute',
        top: position.includes('t') ? '-3px' : 'auto',
        bottom: position.includes('b') ? '-3px' : 'auto',
        left: position.includes('l') ? '-3px' : 'auto',
        right: position.includes('r') ? '-3px' : 'auto',
        transform: `rotate(${rot}deg)`,
        pointerEvents: 'none',
        zIndex: 10,
        filter: 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.65))',
      }}
    >
      <circle cx="18" cy="18" r="3.8" fill="#c6924b" stroke="#4a2a12" strokeWidth="1.2" />
      <circle cx="17" cy="17" r="1.3" fill="#fff" opacity="0.6" />
      <g strokeLinecap="round">
        <path d="M 0 35 Q 18 18 35 0" stroke="#3b1f0c" strokeWidth="8.5" fill="none" />
        <path d="M 0 35 Q 18 18 35 0" stroke="#9e6e3c" strokeWidth="6.5" fill="none" />
        <line x1="3" y1="30" x2="8" y2="36" stroke="#e0ba87" strokeWidth="2.4" />
        <line x1="9" y1="23" x2="16" y2="30" stroke="#e0ba87" strokeWidth="2.4" />
        <line x1="16" y1="16" x2="23" y2="23" stroke="#e0ba87" strokeWidth="2.4" />
        <line x1="23" y1="9" x2="30" y2="16" stroke="#e0ba87" strokeWidth="2.4" />
        <line x1="30" y1="3" x2="36" y2="8" stroke="#e0ba87" strokeWidth="2.4" />
      </g>
    </svg>
  );
};

export const QuickEnergyModal: React.FC<QuickEnergyModalProps> = ({
  onClose,
  energy,
  maxEnergy,
  secondsToNextEnergy,
  coins,
  onBuyProvision,
}) => {
  const percent = Math.min(100, Math.max(0, (energy / maxEnergy) * 100));

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 65,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop:
          'max(96px, var(--tg-content-safe-area-inset-top, calc(env(safe-area-inset-top, 44px) + 52px)))',
        paddingBottom: 'calc(74px + env(safe-area-inset-bottom, 0px))',
        paddingLeft: '12px',
        paddingRight: '12px',
        animation: 'fadeInBaitModal 0.18s ease-out',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '410px',
          background: 'linear-gradient(180deg, #2b170e 0%, #1e0f08 50%, #150904 100%)',
          borderRadius: '26px',
          border: '3px solid #7d4924',
          boxShadow:
            '0 0 0 1.5px #381e0e, inset 0 0 30px rgba(0, 0, 0, 0.85), 0 16px 44px rgba(0, 0, 0, 0.85)',
          padding: '16px 14px 18px 14px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          boxSizing: 'border-box',
        }}
      >
        <CornerRope position="tl" />
        <CornerRope position="tr" />
        <CornerRope position="bl" />
        <CornerRope position="br" />

        {/* Заголовок */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            padding: '0 6px',
            position: 'relative',
          }}
        >
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: 900,
              color: '#fae4b2',
              letterSpacing: '0.3px',
              textShadow:
                '0 2px 4px rgba(0, 0, 0, 0.95), 0 1px 0 rgba(255, 255, 255, 0.25)',
            }}
          >
            Подкрепиться ☕
          </div>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(40, 22, 12, 0.85)',
              border: '1.5px solid rgba(198, 146, 75, 0.5)',
              color: '#fae4b2',
              fontSize: '14px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
              zIndex: 15,
            }}
          >
            ✕
          </button>
        </div>

        {/* Индикатор текущей энергии */}
        <div
          style={{
            background: 'linear-gradient(180deg, #1b0e07 0%, #26130b 100%)',
            border: '1.5px solid #5a351b',
            borderRadius: '16px',
            padding: '12px 14px',
            marginBottom: '14px',
            boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EnergyIcon size={24} />
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#fef3c7' }}>
                Запас энергии
              </span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#fbbf24' }}>
              {energy} / {maxEnergy}
            </span>
          </div>

          {/* Шкала энергии */}
          <div
            style={{
              width: '100%',
              height: '10px',
              background: 'rgba(0, 0, 0, 0.65)',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #d97706, #fbbf24)',
                boxShadow: '0 0 10px rgba(251, 191, 36, 0.7)',
                borderRadius: '6px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: '#d6c0a9',
            }}
          >
            {energy >= maxEnergy ? (
              <span style={{ color: '#86efac', fontWeight: 700 }}>
                ✓ Энергия полностью восстановлена
              </span>
            ) : (
              <>
                <span>+1 ⚡ каждые 60 сек</span>
                <span style={{ color: '#fcd34d', fontWeight: 800 }}>
                  До +1: {formatSeconds(secondsToNextEnergy)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Список провизии */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
          {PROVISIONS.map((item) => {
            const canAfford = coins >= item.price;
            const isFull = energy >= maxEnergy;
            const isDisabled = !canAfford || isFull;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '16px',
                  background: 'linear-gradient(180deg, #6c3b1b 0%, #512a12 50%, #3e1e0b 100%)',
                  border: '1.5px solid #2f170a',
                  boxShadow:
                    'inset 0 1px 0 rgba(255, 235, 190, 0.22), inset 0 -2px 0 rgba(0, 0, 0, 0.55), 0 3px 8px rgba(0, 0, 0, 0.45)',
                }}
              >
                {/* Иконка */}
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '14px',
                    background: 'radial-gradient(circle at 50% 50%, #1c0e07 0%, #0d0603 100%)',
                    border: '1.5px solid #3d2110',
                    boxShadow: 'inset 0 3px 6px rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>

                {/* Название и описание */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#fef3c7' }}>
                      {item.name}
                    </span>
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        color: '#fff',
                        fontSize: '9.5px',
                        fontWeight: 900,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(22, 163, 74, 0.4)',
                      }}
                    >
                      +{item.energyBonus} ⚡
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#d6c0a9',
                      lineHeight: 1.25,
                    }}
                  >
                    {item.description}
                  </div>
                </div>

                {/* Кнопка покупки / применения */}
                <button
                  onClick={() => onBuyProvision(item.id)}
                  disabled={isDisabled}
                  style={{
                    flexShrink: 0,
                    background: isDisabled
                      ? 'rgba(40, 24, 15, 0.8)'
                      : 'linear-gradient(180deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                    border: isDisabled
                      ? '1.5px solid #3d2110'
                      : '1.5px solid #fde047',
                    borderRadius: '12px',
                    padding: '8px 10px',
                    color: isDisabled ? '#78716c' : '#ffffff',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    boxShadow: isDisabled
                      ? 'none'
                      : '0 0 12px rgba(245, 158, 11, 0.4), 0 2px 6px rgba(0, 0, 0, 0.4)',
                    minWidth: '72px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 900, fontSize: '12px' }}>
                    <span>{item.price}</span>
                    <CoinIcon size={12} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800 }}>
                    {isFull ? 'Сыт' : item.id === 'tea' ? 'Выпить' : 'Съесть'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Нижняя строчка с балансом монет */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 8px 0 8px',
            borderTop: '1px solid rgba(198, 146, 75, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#fef3c7' }}>
            <span>Ваш баланс:</span>
            <span style={{ fontWeight: 800, color: '#fbbf24' }}>{coins}</span>
            <CoinIcon size={14} />
          </div>
          <span style={{ fontSize: '11px', color: '#a8a29e' }}>
            Расход: 5 ⚡ на заброс
          </span>
        </div>
      </div>
    </div>
  );
};
