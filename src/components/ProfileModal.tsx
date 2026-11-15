import React from 'react';
import type { UserAvatarId } from '../hooks/usePlayerState';
import { triggerHaptic } from '../utils/haptics';
import { APP_VERSION } from '../version';

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  level: number;
  exp: number;
  maxExp: number;
  avatar: UserAvatarId;
  onSelectAvatar: (avatar: UserAvatarId) => void;
  onRestartTutorial?: () => void;
  onResetProgress?: () => void;
}

export const AVATAR_OPTIONS: {
  id: UserAvatarId;
  label: string;
  sublabel: string;
  image: string;
  activeColor: string;
}[] = [
  {
    id: 'male',
    label: 'Рыбак',
    sublabel: 'Мужской образ',
    image: '/assets/avatars/avatar_male.webp',
    activeColor: '#38bdf8',
  },
  {
    id: 'female',
    label: 'Рыбачка',
    sublabel: 'Женский образ',
    image: '/assets/avatars/avatar_female.webp',
    activeColor: '#f472b6',
  },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userName,
  level,
  exp,
  maxExp,
  avatar,
  onSelectAvatar,
  onRestartTutorial,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const expPercentage = Math.min(100, Math.max(0, (exp / maxExp) * 100));

  const handleSelect = (newAvatar: UserAvatarId) => {
    if (newAvatar !== avatar) {
      triggerHaptic('selection');
      onSelectAvatar(newAvatar);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm('Точно сбросить весь прогресс до 1 уровня? Это действие необратимо.');
    if (confirmed) {
      if (onResetProgress) {
        await onResetProgress();
      } else {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 11, 20, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #132238 0%, #0d1827 100%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15)',
          padding: '20px',
          position: 'relative',
          color: '#ffffff',
          userSelect: 'none',
        }}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#94a3b8',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          ✕
        </button>

        {/* Заголовок */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Личный кабинет
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
            Профиль рыболова
          </div>
        </div>

        {/* Карточка текущего профиля с аватаром */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: avatar === 'female'
                ? '0 0 20px rgba(244, 114, 182, 0.4)'
                : '0 0 20px rgba(56, 189, 248, 0.4)',
              border: avatar === 'female' ? '2.5px solid #f472b6' : '2.5px solid #38bdf8',
              background: '#091325',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={avatar === 'female' ? '/assets/avatars/avatar_female.webp' : '/assets/avatars/avatar_male.webp'}
              alt={userName || 'Рыбак'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '17px',
                fontWeight: 900,
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {userName || 'Рыболов'}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginTop: '3px',
                padding: '2px 8px',
                background: 'rgba(251, 191, 36, 0.15)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#fbbf24',
              }}
            >
              ⭐ Уровень {level}
            </div>

            {/* Шкала опыта */}
            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#94a3b8',
                  marginBottom: '3px',
                }}
              >
                <span>Опыт</span>
                <span style={{ color: '#38bdf8' }}>{exp} / {maxExp} XP</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${expPercentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Секция: Выбор аватара */}
        <div style={{ marginBottom: '22px' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#cbd5e1',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🎭</span>
            <span>Внешность рыбака:</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            {AVATAR_OPTIONS.map((opt) => {
              const isSelected = avatar === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(180deg, rgba(56, 189, 248, 0.16) 0%, rgba(14, 165, 233, 0.08) 100%)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected
                      ? `2px solid ${opt.activeColor}`
                      : '1.5px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '14px 10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isSelected
                      ? `0 8px 20px ${opt.activeColor}33, inset 0 0 12px ${opt.activeColor}22`
                      : 'none',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {/* Бейдж выбран */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-9px',
                        background: opt.activeColor,
                        color: '#091325',
                        fontSize: '9.5px',
                        fontWeight: 900,
                        padding: '1px 8px',
                        borderRadius: '10px',
                        letterSpacing: '0.3px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      }}
                    >
                      ✓ ВЫБРАН
                    </div>
                  )}

                  {/* Картинка аватара */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      marginBottom: '8px',
                      border: isSelected
                        ? `2px solid ${opt.activeColor}`
                        : '1.5px solid rgba(255, 255, 255, 0.2)',
                      background: '#091325',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    }}
                  >
                    <img
                      src={opt.image}
                      alt={opt.label}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>

                  {/* Название */}
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      marginBottom: '2px',
                    }}
                  >
                    {opt.label}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: isSelected ? opt.activeColor : '#64748b',
                      fontWeight: 600,
                    }}
                  >
                    {opt.sublabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Секция: Настройки */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '14px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Настройки и отладка
          </div>

          {onRestartTutorial && (
            <button
              onClick={() => {
                triggerHaptic('notification');
                onRestartTutorial();
                onClose();
              }}
              style={{
                width: '100%',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#4ade80',
                borderRadius: '12px',
                padding: '9px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              🎓 Пройти обучение заново
            </button>
          )}

          <button
            onClick={handleReset}
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              borderRadius: '12px',
              padding: '9px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            ⚠️ Сбросить весь прогресс
          </button>
        </div>

        {/* Футер */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '6px',
          }}
        >
          <div style={{ fontSize: '10px', color: '#64748b' }}>
            Версия: {APP_VERSION}
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: '1px solid #38bdf8',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
            }}
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
