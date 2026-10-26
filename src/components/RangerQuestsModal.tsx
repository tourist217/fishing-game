import React from 'react';
import type { DailyQuest } from '../types/quests';
import { DAILY_BONUS_REWARD } from '../types/quests';
import { triggerHaptic } from '../utils/haptics';
import { CoinIcon } from './CoinIcon';

interface RangerQuestsModalProps {
  quests: DailyQuest[];
  allCompletedBonusClaimed: boolean;
  timeUntilMidnight: string;
  completedCount: number;
  canClaimBonus: boolean;
  onClaimQuestReward: (questId: string) => boolean;
  onClaimDailyBonus: () => boolean;
  onClose: () => void;
}

export const RangerQuestsModal: React.FC<RangerQuestsModalProps> = ({
  quests,
  allCompletedBonusClaimed,
  timeUntilMidnight,
  completedCount,
  canClaimBonus,
  onClaimQuestReward,
  onClaimDailyBonus,
  onClose,
}) => {
  const getDifficultyBadge = (difficulty: DailyQuest['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return {
          label: 'Обычный заказ',
          color: '#ffffff',
          bg: 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)',
          border: '#38bdf8',
        };
      case 'medium':
        return {
          label: 'Опытный заказ',
          color: '#ffffff',
          bg: 'linear-gradient(90deg, #9333ea 0%, #7e22ce 100%)',
          border: '#c084fc',
        };
      case 'hard':
        return {
          label: 'Мастерский заказ',
          color: '#1c1917',
          bg: 'linear-gradient(90deg, #facc15 0%, #ca8a04 100%)',
          border: '#fde047',
        };
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        background: 'rgba(5, 10, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'max(84px, var(--tg-content-safe-area-inset-top, calc(env(safe-area-inset-top, 44px) + 40px))) 12px calc(12px + env(safe-area-inset-bottom, 0px)) 12px',
        userSelect: 'none',
      }}
    >
      {/* Главный стенд объявлений из тёмного морёного дуба с латунным кантом */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '360px',
          height: '100%',
          maxHeight: '100%',
          background: 'linear-gradient(180deg, #2b1810 0%, #1c0f0a 60%, #120906 100%)',
          borderRadius: '26px',
          border: '2px solid #854d0e',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85), inset 0 0 24px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(251, 191, 36, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Угловые латунные заклёпки */}
        <div style={{ position: 'absolute', top: '9px', left: '9px', width: '7px', height: '7px', borderRadius: '50%', background: 'radial-gradient(circle, #fde047 30%, #854d0e 100%)', boxShadow: '0 1px 3px rgba(0,0,0,0.9)', zIndex: 5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '9px', right: '9px', width: '7px', height: '7px', borderRadius: '50%', background: 'radial-gradient(circle, #fde047 30%, #854d0e 100%)', boxShadow: '0 1px 3px rgba(0,0,0,0.9)', zIndex: 5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '9px', left: '9px', width: '7px', height: '7px', borderRadius: '50%', background: 'radial-gradient(circle, #fde047 30%, #854d0e 100%)', boxShadow: '0 1px 3px rgba(0,0,0,0.9)', zIndex: 5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '9px', right: '9px', width: '7px', height: '7px', borderRadius: '50%', background: 'radial-gradient(circle, #fde047 30%, #854d0e 100%)', boxShadow: '0 1px 3px rgba(0,0,0,0.9)', zIndex: 5, pointerEvents: 'none' }} />

        {/* Шапка доски объявлений */}
        <div
          style={{
            padding: '14px 16px 10px 16px',
            background: 'linear-gradient(180deg, rgba(61, 35, 20, 0.85) 0%, rgba(38, 20, 11, 0.85) 100%)',
            borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                padding: '2px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #78350f 100%)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
              }}
            >
              <img
                src="/assets/icons/ranger_quests.png"
                alt="Егерь"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: '16.5px',
                  fontWeight: 900,
                  color: '#fef3c7',
                  lineHeight: 1.15,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 10px rgba(251, 191, 36, 0.35)',
                  letterSpacing: '0.3px',
                }}
              >
                Заказы Егеря
              </div>
              <div style={{ fontSize: '11px', color: '#fed7aa', fontWeight: 600, marginTop: '2px' }}>
                Ежедневные поручения лесничества
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #3d2314 0%, #1c0f0a 100%)',
              border: '1.5px solid rgba(251, 191, 36, 0.4)',
              color: '#fde68a',
              fontSize: '13px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Скроллируемая область контента */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '11px',
          }}
        >
          {/* Реплика Егеря на состаренном пергаментном свитке */}
          <div
            style={{
              background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 65%, #fcd34d 100%)',
              borderRadius: '16px',
              border: '1px solid #b45309',
              padding: '11px 13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 0 14px rgba(180, 83, 9, 0.22)',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#451a03', fontWeight: 700, lineHeight: 1.45 }}>
              «<strong style={{ color: '#270d01' }}>Здорово, рыбак!</strong> Лес шумит, рыба гуляет. Выполни мои 3 поручения за день — и получишь
              дополнительную премию от егерской службы!»
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '6px',
                borderTop: '1px solid rgba(180, 83, 9, 0.25)',
                fontSize: '11px',
              }}
            >
              <span style={{ color: '#78350f', fontWeight: 800 }}>⏳ Новые заказы через:</span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '12px',
                  color: '#fef08a',
                  background: 'rgba(28, 16, 10, 0.88)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid #78350f',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                {timeUntilMidnight}
              </span>
            </div>
          </div>

          {/* Карточка премии за все 3 квеста дня */}
          <div
            style={{
              background: canClaimBonus
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.35) 0%, rgba(180, 83, 9, 0.25) 100%)'
                : 'linear-gradient(180deg, #381e10 0%, #231209 100%)',
              borderRadius: '18px',
              border: canClaimBonus
                ? '1.5px solid #fbbf24'
                : '1.5px solid #78350f',
              padding: '12px 13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: canClaimBonus
                ? '0 0 20px rgba(245, 158, 11, 0.4), inset 0 0 12px rgba(245, 158, 11, 0.2)'
                : '0 4px 12px rgba(0, 0, 0, 0.45)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px' }}>🎖️</span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 900,
                    color: '#fef3c7',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  }}
                >
                  Премия Егеря за день
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  color: completedCount === 3 ? '#4ade80' : '#fbbf24',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                }}
              >
                {completedCount} / 3 выполнено
              </span>
            </div>

            {/* Трёхсегментный прогресс-бар */}
            <div
              style={{
                display: 'flex',
                gap: '5px',
                height: '7px',
                background: '#120906',
                padding: '1px',
                borderRadius: '5px',
                border: '1px solid #451a03',
              }}
            >
              {[0, 1, 2].map((idx) => {
                const isFilled = idx < completedCount;
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      borderRadius: '3px',
                      background: isFilled
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'rgba(255, 255, 255, 0.06)',
                      boxShadow: isFilled ? '0 0 8px rgba(251, 191, 36, 0.65)' : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Награды за премию */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '11.5px', fontWeight: 900, alignItems: 'center' }}>
                <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  +{DAILY_BONUS_REWARD.coins} <CoinIcon size={13} />
                </span>
                <span style={{ color: '#38bdf8' }}>+{DAILY_BONUS_REWARD.gems} 💎</span>
                <span style={{ color: '#c084fc' }}>+{DAILY_BONUS_REWARD.exp} XP</span>
              </div>

              {canClaimBonus && (
                <button
                  onClick={() => {
                    onClaimDailyBonus();
                    triggerHaptic('notification');
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '10px',
                    border: '1px solid #fde047',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 0 14px rgba(245, 158, 11, 0.6)',
                  }}
                >
                  Забрать премию! 🎉
                </button>
              )}

              {allCompletedBonusClaimed && (
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#4ade80' }}>
                  ✓ Награда получена
                </span>
              )}
            </div>
          </div>

          {/* Список 3 поручений Егеря */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quests.map((quest) => {
              const badge = getDifficultyBadge(quest.difficulty);
              const progressRatio = Math.min(1, quest.currentCount / quest.targetCount);
              const progressPercent = Math.round(progressRatio * 100);

              return (
                <div
                  key={quest.id}
                  style={{
                    background: quest.isCompleted && !quest.isClaimed
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(35, 18, 9, 0.95) 100%)'
                      : 'linear-gradient(180deg, #351c10 0%, #201008 100%)',
                    borderRadius: '18px',
                    border: quest.isCompleted && !quest.isClaimed
                      ? '1.5px solid #22c55e'
                      : '1.5px solid #6c3b1a',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: quest.isCompleted && !quest.isClaimed
                      ? '0 0 16px rgba(34, 197, 94, 0.35)'
                      : '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
                    position: 'relative',
                  }}
                >
                  {/* Верхняя строка: Лента категории сложности и Награды */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 900,
                          color: badge.color,
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Награда за заказ */}
                    <div style={{ display: 'flex', gap: '7px', fontSize: '11px', fontWeight: 900, alignItems: 'center' }}>
                      <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        +{quest.rewardCoins} <CoinIcon size={13} />
                      </span>
                      {quest.rewardGems && quest.rewardGems > 0 && (
                        <span style={{ color: '#38bdf8' }}>+{quest.rewardGems} 💎</span>
                      )}
                      <span style={{ color: '#c084fc' }}>+{quest.rewardExp} XP</span>
                    </div>
                  </div>

                  {/* Тело карточки: Иконка в круглом колодце + Описание */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #25130b 40%, #0d0603 100%)',
                        border: '1.5px solid #854d0e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0,
                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.5)',
                      }}
                    >
                      {quest.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#ffffff', lineHeight: 1.2 }}>
                        {quest.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#fed7aa', marginTop: '2px', lineHeight: 1.35, opacity: 0.9 }}>
                        {quest.description}
                      </div>
                    </div>
                  </div>

                  {/* Прогресс-бар с заполнением */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px' }}>
                      <span style={{ color: '#a8a29e', fontWeight: 700 }}>Прогресс</span>
                      <span
                        style={{
                          fontWeight: 900,
                          color: quest.isCompleted ? '#4ade80' : '#fde047',
                        }}
                      >
                        {quest.currentCount} / {quest.targetCount}
                      </span>
                    </div>
                    <div
                      style={{
                        height: '7px',
                        background: '#120906',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        border: '1px solid #451a03',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${progressPercent}%`,
                          background: quest.isCompleted
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                          borderRadius: '4px',
                          boxShadow: quest.isCompleted
                            ? '0 0 8px rgba(52, 211, 153, 0.6)'
                            : '0 0 8px rgba(56, 189, 248, 0.5)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Кнопка состояния выполнения */}
                  <div style={{ marginTop: '2px' }}>
                    {quest.isClaimed ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '6px',
                          borderRadius: '10px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#4ade80',
                          border: '1px solid rgba(74, 222, 128, 0.25)',
                        }}
                      >
                        ✓ Награда получена
                      </div>
                    ) : quest.isCompleted ? (
                      <button
                        onClick={() => {
                          onClaimQuestReward(quest.id);
                          triggerHaptic('notification');
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: '1px solid #6ee7b7',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 900,
                          cursor: 'pointer',
                          boxShadow: '0 0 16px rgba(16, 185, 129, 0.55)',
                        }}
                      >
                        Забрать награду! 🎁
                      </button>
                    ) : (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '6px',
                          borderRadius: '10px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          color: '#d6d3d1',
                        }}
                      >
                        В процессе выполнения ({quest.currentCount}/{quest.targetCount})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Нижняя кнопка возврата на базу в деревянном стиле */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid rgba(251, 191, 36, 0.2)',
            background: 'linear-gradient(180deg, rgba(38, 20, 11, 0.95) 0%, rgba(20, 10, 6, 0.95) 100%)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '14px',
              border: '1.5px solid #b45309',
              background: 'linear-gradient(180deg, #78350f 0%, #451a03 100%)',
              color: '#fde68a',
              fontSize: '13px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
              letterSpacing: '0.4px',
            }}
          >
            <span>🏡</span>
            <span>Вернуться на базу</span>
          </button>
        </div>
      </div>
    </div>
  );
};
