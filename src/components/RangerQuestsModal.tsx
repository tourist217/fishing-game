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
        return { label: 'Обычный заказ', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
      case 'medium':
        return { label: 'Опытный заказ', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' };
      case 'hard':
        return { label: 'Мастерский заказ', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' };
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
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '360px',
          height: '100%',
          maxHeight: '100%',
          background: 'linear-gradient(180deg, #152232 0%, #0c1522 100%)',
          borderRadius: '26px',
          border: '1.5px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Шапка модала */}
        <div
          style={{
            padding: '14px 16px 10px 16px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ fontSize: '26px' }}>🕵️‍♂️</span>
            <div>
              <div style={{ fontSize: '15.5px', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                Заказы Егеря
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Ежедневные поручения лесничества
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#cbd5e1',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
            gap: '10px',
          }}
        >
          {/* Реплика Егеря и Таймер обновления */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.45 }}>
              «Здорово, рыбак! Лес шумит, рыба гуляет. Выполни мои 3 поручения за день — и получишь
              дополнительную премию от егерской службы!»
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '4px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '11px',
              }}
            >
              <span style={{ color: '#94a3b8' }}>⏳ Новые заказы через:</span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.12)',
                  padding: '2px 6px',
                  borderRadius: '6px',
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
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)'
                : 'rgba(20, 28, 42, 0.75)',
              borderRadius: '18px',
              border: canClaimBonus
                ? '1.5px solid #f59e0b'
                : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: canClaimBonus ? '0 0 18px rgba(245, 158, 11, 0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px' }}>🎖️</span>
                <span style={{ fontSize: '12.5px', fontWeight: 900, color: '#ffffff' }}>
                  Премия Егеря за день
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  color: completedCount === 3 ? '#4ade80' : '#f59e0b',
                }}
              >
                {completedCount} / 3 выполнено
              </span>
            </div>

            {/* Сегментированный прогресс-бар */}
            <div style={{ display: 'flex', gap: '4px', height: '6px' }}>
              {[0, 1, 2].map((idx) => {
                const isFilled = idx < completedCount;
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      borderRadius: '3px',
                      background: isFilled
                        ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                        : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: isFilled ? '0 0 6px rgba(74, 222, 128, 0.5)' : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Награды за премию */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '6px', fontSize: '11px', fontWeight: 800, alignItems: 'center' }}>
                <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>+{DAILY_BONUS_REWARD.coins} <CoinIcon size={13} /></span>
                <span style={{ color: '#38bdf8' }}>+{DAILY_BONUS_REWARD.gems} 💎</span>
                <span style={{ color: '#a78bfa' }}>+{DAILY_BONUS_REWARD.exp} XP</span>
              </div>

              {canClaimBonus && (
                <button
                  onClick={() => {
                    onClaimDailyBonus();
                    triggerHaptic('notification');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.45)',
                  }}
                >
                  Забрать премию!
                </button>
              )}

              {allCompletedBonusClaimed && (
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#4ade80' }}>
                  ✓ Награда получена
                </span>
              )}
            </div>
          </div>

          {/* Список 3 заданий */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {quests.map((quest) => {
              const badge = getDifficultyBadge(quest.difficulty);
              const progressRatio = Math.min(1, quest.currentCount / quest.targetCount);
              const progressPercent = Math.round(progressRatio * 100);

              return (
                <div
                  key={quest.id}
                  style={{
                    background: quest.isCompleted && !quest.isClaimed
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%)'
                      : 'rgba(20, 28, 42, 0.65)',
                    borderRadius: '18px',
                    border: quest.isCompleted && !quest.isClaimed
                      ? '1.5px solid #22c55e'
                      : '1px solid rgba(255, 255, 255, 0.09)',
                    padding: '11px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px',
                    boxShadow: quest.isCompleted && !quest.isClaimed
                      ? '0 0 14px rgba(34, 197, 94, 0.25)'
                      : 'none',
                  }}
                >
                  {/* Верхняя строка карточки: бейдж сложности и иконка */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '18px' }}>{quest.icon}</span>
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 800,
                          color: badge.color,
                          background: badge.bg,
                          padding: '2px 6px',
                          borderRadius: '6px',
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Награда */}
                    <div style={{ display: 'flex', gap: '6px', fontSize: '11px', fontWeight: 800, alignItems: 'center' }}>
                      <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>+{quest.rewardCoins} <CoinIcon size={13} /></span>
                      {quest.rewardGems && quest.rewardGems > 0 && (
                        <span style={{ color: '#38bdf8' }}>+{quest.rewardGems} 💎</span>
                      )}
                      <span style={{ color: '#a78bfa' }}>+{quest.rewardExp} XP</span>
                    </div>
                  </div>

                  {/* Название и описание */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                      {quest.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', lineHeight: 1.35 }}>
                      {quest.description}
                    </div>
                  </div>

                  {/* Прогресс-бар */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px' }}>
                      <span style={{ color: '#64748b' }}>Прогресс</span>
                      <span
                        style={{
                          fontWeight: 800,
                          color: quest.isCompleted ? '#4ade80' : '#cbd5e1',
                        }}
                      >
                        {quest.currentCount} / {quest.targetCount}
                      </span>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${progressPercent}%`,
                          background: quest.isCompleted
                            ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                            : 'linear-gradient(90deg, #38bdf8, #0284c7)',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Кнопка действия */}
                  <div style={{ marginTop: '2px' }}>
                    {quest.isClaimed ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '6px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#4ade80',
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
                          padding: '7px 12px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#ffffff',
                          fontSize: '11.5px',
                          fontWeight: 900,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                        }}
                      >
                        Забрать награду! 🎁
                      </button>
                    ) : (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '5px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: '#64748b',
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

        {/* Нижняя кнопка возврата на базу */}
        <div
          style={{
            padding: '8px 14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
              color: '#94a3b8',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>🏠</span>
            <span>Вернуться на базу</span>
          </button>
        </div>
      </div>
    </div>
  );
};
