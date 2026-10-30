import React from 'react';
import { AVAILABLE_BAITS } from '../hooks/useBaitState';
import { BoardHeader } from './BoardHeader';

interface BaitSelectModalProps {
  onClose: () => void;
  selectedBaitId: string;
  onSelectBait: (baitId: string) => void;
  baits: Record<string, number>;
  playerLevel: number;
  onOpenShop?: () => void;
}

export const BaitSelectModal: React.FC<BaitSelectModalProps> = ({
  onClose,
  selectedBaitId,
  onSelectBait,
  baits,
  playerLevel,
  onOpenShop,
}) => {
  const activeBaitsCount = Object.values(baits).filter((c) => c > 0).length;

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
        padding: 'max(10px, env(safe-area-inset-top, 10px)) 8px max(10px, env(safe-area-inset-bottom, 10px)) 8px',
        animation: 'fadeInBaitModal 0.18s ease-out',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* 1. СЛОЙ ФОНА: Универсальная деревянная доска с чистой планкой, сеткой и листьями */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(94vh * 0.727, 100vw - 16px, 420px)',
          aspectRatio: '745 / 1024',
          maxHeight: '94vh',
          backgroundImage: "url('/assets/ui/universal_board.png')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'drop-shadow(0 18px 45px rgba(0, 0, 0, 0.95))',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* 2. СЛОЙ ЗАГОЛОВКА: Единый 3D золотой заголовок поверх верхней деревянной планки */}
        <BoardHeader title="Наживки" subtitle="Выберите наживку для успешного клёва" />

        {/* 3. СЛОЙ КНОПКИ ЗАКРЫТИЯ (Круглый красный крестик в правом верхнем углу) */}
        <button
          onClick={onClose}
          aria-label="Закрыть"
          style={{
            position: 'absolute',
            right: '5.5%',
            top: '4.0%',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)',
            border: '1.5px solid rgba(254, 202, 202, 0.7)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.65)',
            zIndex: 20,
            transition: 'transform 0.1s ease',
          }}
        >
          ✕
        </button>

        {/* 4. СЛОЙ КОНТЕНТА: Рабочая область внутри деревянной рамы */}
        <div
          style={{
            position: 'absolute',
            left: '7.5%',
            right: '7.5%',
            top: '12.8%',
            bottom: '6.2%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '4px 2px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {/* Инфо-полоса вместимости ведра */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(180, 83, 9, 0.35)',
              fontSize: '11.5px',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.6)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fef3c7', fontWeight: 800 }}>
              <span>🪣</span>
              <span>Вместимость ведра:</span>
            </div>
            <div style={{ fontWeight: 900, color: '#fde047', fontFamily: 'monospace', fontSize: '12px' }}>
              {activeBaitsCount} / {AVAILABLE_BAITS.length} видов
            </div>
          </div>

          {/* Список резных деревянных карточек наживок */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              overflowY: 'auto',
              paddingRight: '2px',
              paddingBottom: '2px',
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
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '15px',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.58 : 1,
                    position: 'relative',
                    background: isSelected
                      ? 'linear-gradient(180deg, rgba(82, 45, 21, 0.95) 0%, rgba(46, 24, 11, 0.98) 100%)'
                      : 'linear-gradient(180deg, rgba(67, 36, 17, 0.9) 0%, rgba(42, 21, 9, 0.95) 100%)',
                    border: isSelected ? '2px solid #84cc16' : '1.5px solid #6b3d1b',
                    boxShadow: isSelected
                      ? '0 0 16px rgba(132, 204, 22, 0.45), inset 0 0 10px rgba(132, 204, 22, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.25), 0 4px 10px rgba(0, 0, 0, 0.5)'
                      : 'inset 0 1px 2px rgba(255, 255, 255, 0.18), inset 0 -2px 4px rgba(0, 0, 0, 0.6), 0 3px 8px rgba(0, 0, 0, 0.45)',
                    transition: 'all 0.14s ease',
                    flexShrink: 0,
                  }}
                >
                  {/* Иконка наживки в резном углублении */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'radial-gradient(circle at 50% 50%, #1c0e07 0%, #0d0603 100%)',
                      border: isSelected
                        ? '1.8px solid rgba(132, 204, 22, 0.8)'
                        : '1.5px solid rgba(120, 65, 30, 0.6)',
                      boxShadow: 'inset 0 3px 6px rgba(0, 0, 0, 0.8), 0 1px 1px rgba(255, 255, 255, 0.1)',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '3px',
                      boxSizing: 'border-box',
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
                        filter: isLocked ? 'grayscale(0.6)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                      }}
                    />
                    {isLocked && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0, 0, 0, 0.65)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 800,
                          color: '#fef3c7',
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
                          letterSpacing: '0.2px',
                        }}
                      >
                        {b.name}
                      </span>

                      {isSelected && (
                        <span
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#ffffff',
                            fontSize: '9px',
                            fontWeight: 900,
                            padding: '1px 6px',
                            borderRadius: '5px',
                            letterSpacing: '0.4px',
                            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.45)',
                            border: '1px solid #34d399',
                          }}
                        >
                          АКТИВНО
                        </span>
                      )}

                      {isLocked && (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            color: '#fcd34d',
                            background: 'rgba(40, 24, 12, 0.85)',
                            padding: '1px 5px',
                            borderRadius: '5px',
                            border: '1px solid rgba(251, 191, 36, 0.4)',
                          }}
                        >
                          С {b.levelReq} ур.
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#d6c0a9',
                        lineHeight: 1.25,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                      }}
                    >
                      {b.description}
                    </div>
                  </div>

                  {/* Резной бейдж наличия справа */}
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 900,
                      minWidth: '54px',
                      textAlign: 'center',
                      padding: '4px 8px',
                      borderRadius: '9px',
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
                      textShadow: count > 0 ? '0 0 8px rgba(74, 222, 128, 0.35)' : 'none',
                    }}
                  >
                    {count > 0 ? `${count} шт.` : isLocked ? '🔒' : '0 шт.'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5. Нижняя кнопка перехода в магазин за наживкой (отдельный слой) */}
          {onOpenShop && (
            <button
              onClick={() => {
                onClose();
                onOpenShop();
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '14px',
                background: 'linear-gradient(180deg, #d97706 0%, #b45309 50%, #78350f 100%)',
                border: '1.5px solid #fde047',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.35)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',
                flexShrink: 0,
                transition: 'transform 0.12s ease',
              }}
            >
              <span>🛒</span>
              <span>Купить наживку в магазине</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
