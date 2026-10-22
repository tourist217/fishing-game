import React from 'react';
import { AVAILABLE_BAITS } from '../hooks/useBaitState';

interface BaitSelectModalProps {
  onClose: () => void;
  selectedBaitId: string;
  onSelectBait: (baitId: string) => void;
  baits: Record<string, number>;
  playerLevel: number;
}

// Угловые верёвки и латунные заклёпки (как на референсе)
const CornerRope = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const rot = position === 'tl' ? 0 : position === 'tr' ? 90 : position === 'br' ? 180 : 270;
  return (
    <svg
      width="46"
      height="46"
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
      {/* Латунная заклёпка под верёвкой */}
      <circle cx="18" cy="18" r="3.8" fill="#c6924b" stroke="#4a2a12" strokeWidth="1.2" />
      <circle cx="17" cy="17" r="1.3" fill="#fff" opacity="0.6" />

      {/* Толстый жгут верёвки через угол */}
      <g strokeLinecap="round">
        {/* Тёмная подложка-тень */}
        <path d="M 0 35 Q 18 18 35 0" stroke="#3b1f0c" strokeWidth="8.5" fill="none" />
        {/* Основное витое тело верёвки */}
        <path d="M 0 35 Q 18 18 35 0" stroke="#9e6e3c" strokeWidth="6.5" fill="none" />
        {/* Светлые блики витков пеньки */}
        <line x1="3" y1="30" x2="8" y2="36" stroke="#e0ba87" strokeWidth="2.4" />
        <line x1="9" y1="23" x2="16" y2="30" stroke="#e0ba87" strokeWidth="2.4" />
        <line x1="16" y1="16" x2="23" y2="23" stroke="#e0ba87" strokeWidth="2.4" />
        <line x1="23" y1="9" x2="30" y2="16" stroke="#e0ba87" strokeWidth="2.4" />
        <line x1="30" y1="3" x2="36" y2="8" stroke="#e0ba87" strokeWidth="2.4" />
      </g>
    </svg>
  );
};

// Мини-верёвки на углах выбранной карточки
const SelectedCardCornerRope = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const rot = position === 'tl' ? 0 : position === 'tr' ? 90 : position === 'br' ? 180 : 270;
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      style={{
        position: 'absolute',
        top: position.includes('t') ? '-1px' : 'auto',
        bottom: position.includes('b') ? '-1px' : 'auto',
        left: position.includes('l') ? '-1px' : 'auto',
        right: position.includes('r') ? '-1px' : 'auto',
        transform: `rotate(${rot}deg)`,
        pointerEvents: 'none',
        zIndex: 4,
      }}
    >
      <path d="M 0 16 Q 8 8 16 0" stroke="#3e2210" strokeWidth="4.5" fill="none" />
      <path d="M 0 16 Q 8 8 16 0" stroke="#d49b55" strokeWidth="3" fill="none" />
      <line x1="3" y1="11" x2="7" y2="15" stroke="#fce4b8" strokeWidth="1.2" />
      <line x1="8" y1="6" x2="12" y2="10" stroke="#fce4b8" strokeWidth="1.2" />
      <line x1="12" y1="2" x2="16" y2="6" stroke="#fce4b8" strokeWidth="1.2" />
    </svg>
  );
};

export const BaitSelectModal: React.FC<BaitSelectModalProps> = ({
  onClose,
  selectedBaitId,
  onSelectBait,
  baits,
  playerLevel,
}) => {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 60,
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
      {/* Основная деревянная панель с бронзовой окантовкой и верёвками */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '100%',
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
        {/* Угловые витые верёвки на всех 4 углах рамы */}
        <CornerRope position="tl" />
        <CornerRope position="tr" />
        <CornerRope position="bl" />
        <CornerRope position="br" />

        {/* Заголовок с 3D деревянно-золотым рельефом */}
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
                '0 2px 4px rgba(0, 0, 0, 0.95), 0 1px 0 rgba(255, 255, 255, 0.25), 0 -1px 0 rgba(0, 0, 0, 0.6)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Выберите наживку
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

        {/* Список наживок (деревянные резные плашки) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '9px',
            overflowY: 'auto',
            paddingRight: '2px',
            paddingBottom: '4px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#7d4924 #1e0f08',
            flex: 1,
            minHeight: 0,
          }}
        >
          {AVAILABLE_BAITS.map((b) => {
            const count = baits[b.id] || 0;
            const isSelected = selectedBaitId === b.id;
            const isLocked = playerLevel < (b.levelReq || 1) && count === 0;

            return (
              <div
                key={b.id}
                onClick={() => {
                  if (isLocked) return;
                  onSelectBait(b.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '9px 12px',
                  borderRadius: '16px',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.55 : 1,
                  position: 'relative',
                  /* Тёплый градиент натуральной деревянной планки */
                  background: isSelected
                    ? 'linear-gradient(180deg, #7c4420 0%, #5d3115 50%, #46220d 100%)'
                    : 'linear-gradient(180deg, #6c3b1b 0%, #512a12 50%, #3e1e0b 100%)',
                  /* Окантовка и резной рельеф */
                  border: isSelected ? '2px solid #f59e0b' : '1.5px solid #2f170a',
                  boxShadow: isSelected
                    ? '0 0 16px rgba(245, 158, 11, 0.45), inset 0 0 10px rgba(245, 158, 11, 0.25), inset 0 1px 0 rgba(255, 240, 200, 0.35), 0 4px 10px rgba(0, 0, 0, 0.5)'
                    : 'inset 0 1px 0 rgba(255, 235, 190, 0.22), inset 0 -2px 0 rgba(0, 0, 0, 0.55), 0 3px 8px rgba(0, 0, 0, 0.45)',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {/* Если выбрано — верёвочные узелки по углам карточки (как на референсе у Червя) */}
                {isSelected && (
                  <>
                    <SelectedCardCornerRope position="tl" />
                    <SelectedCardCornerRope position="tr" />
                    <SelectedCardCornerRope position="bl" />
                    <SelectedCardCornerRope position="br" />
                  </>
                )}

                {/* Утопленный квадратный лоток под 3D иконку наживки */}
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'radial-gradient(circle at 50% 50%, #1c0e07 0%, #0d0603 100%)',
                    border: isSelected
                      ? '1.8px solid rgba(251, 191, 36, 0.7)'
                      : '1.5px solid #3d2110',
                    boxShadow:
                      'inset 0 3px 6px rgba(0, 0, 0, 0.8), 0 1px 1px rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={b.image}
                    alt={b.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      filter: isLocked ? 'grayscale(0.6)' : 'none',
                    }}
                  />
                  {isLocked && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                      }}
                    >
                      🔒
                    </div>
                  )}
                </div>

                {/* Название и описание наживки */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: '#fef3c7',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.85)',
                        letterSpacing: '0.2px',
                      }}
                    >
                      {b.name}
                    </span>

                    {/* Бейдж выбранной наживки в небесно-голубом стиле референса */}
                    {isSelected && (
                      <span
                        style={{
                          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                          color: '#ffffff',
                          fontSize: '9.5px',
                          fontWeight: 900,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          letterSpacing: '0.5px',
                          boxShadow: '0 2px 6px rgba(2, 132, 199, 0.45)',
                          border: '1px solid #38bdf8',
                        }}
                      >
                        ✓ ВЫБРАНО
                      </span>
                    )}

                    {/* Если заблокирована по уровню */}
                    {isLocked && (
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 800,
                          color: '#fcd34d',
                          background: 'rgba(40, 24, 12, 0.85)',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          border: '1px solid rgba(251, 191, 36, 0.4)',
                        }}
                      >
                        С {b.levelReq} ур. 🔒
                      </span>
                    )}
                  </div>

                  {/* Описание (пшенично-бежевый цвет) */}
                  <div
                    style={{
                      fontSize: '11.5px',
                      color: '#d6c0a9',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    {b.description}
                  </div>
                </div>

                {/* Резной бейдж наличия справа (по референсу) */}
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 900,
                    minWidth: '58px',
                    textAlign: 'center',
                    padding: '5px 10px',
                    borderRadius: '10px',
                    /* Вдавленный лоток */
                    background:
                      count > 0
                        ? 'linear-gradient(180deg, #1b0e07 0%, #29150c 100%)'
                        : isLocked
                        ? 'linear-gradient(180deg, #170d07 0%, #201109 100%)'
                        : 'linear-gradient(180deg, #2b0e0e 0%, #1c0808 100%)',
                    border:
                      count > 0
                        ? '1.5px solid #5a341b'
                        : isLocked
                        ? '1.5px solid #3a1e0f'
                        : '1.5px solid #842323',
                    color: count > 0 ? '#86efac' : isLocked ? '#94a3b8' : '#f87171',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.7)',
                    whiteSpace: 'nowrap',
                    textShadow:
                      count > 0
                        ? '0 0 8px rgba(74, 222, 128, 0.35)'
                        : count === 0 && !isLocked
                        ? '0 0 8px rgba(248, 113, 113, 0.35)'
                        : 'none',
                  }}
                >
                  {count > 0 ? `${count} шт.` : isLocked ? '🔒' : 'Нет'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
