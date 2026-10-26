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
          bg: 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)',
          border: '#38bdf8',
        };
      case 'medium':
        return {
          label: 'Опытный заказ',
          color: '#ffffff',
          bg: 'linear-gradient(180deg, #9333ea 0%, #7e22ce 100%)',
          border: '#c084fc',
        };
      case 'hard':
        return {
          label: 'Мастерский заказ',
          color: '#1c1917',
          bg: 'linear-gradient(180deg, #facc15 0%, #ca8a04 100%)',
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
      {/* Главный стенд объявлений из тёмного морёного дуба с верёвочной обвязкой и латунными уголками */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '360px',
          height: '100%',
          maxHeight: '100%',
          backgroundImage: "url('/assets/ui/bg_ranger_board.jpg')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(251, 191, 36, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Шапка доски объявлений */}
        <div
          style={{
            padding: '16px 18px 12px 18px',
            background: 'linear-gradient(180deg, rgba(30, 16, 9, 0.88) 0%, rgba(20, 10, 5, 0.72) 100%)',
            borderBottom: '1.5px solid rgba(251, 191, 36, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                padding: '2px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #78350f 100%)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
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
                  fontSize: '17px',
                  fontWeight: 900,
                  color: '#fef3c7',
                  lineHeight: 1.15,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 12px rgba(251, 191, 36, 0.4)',
                  letterSpacing: '0.4px',
                }}
              >
                Заказы Егеря
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#fed7aa',
                  fontWeight: 700,
                  marginTop: '2px',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.9)',
                }}
              >
                Ежедневные поручения лесничества
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #4a2815 0%, #201008 100%)',
              border: '1.5px solid #fbbf24',
              color: '#fde68a',
              fontSize: '13px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.7)',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
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
            gap: '12px',
          }}
        >
          {/* Реплика Егеря на состаренном пергаментном свитке */}
          <div
            style={{
              backgroundImage: "url('/assets/ui/parchment_banner.png')",
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              padding: '24px 18px 16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.65))',
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: '#381a04',
                fontWeight: 700,
                lineHeight: 1.45,
                textShadow: '0 1px 0 rgba(255, 255, 255, 0.4)',
              }}
            >
              «<strong style={{ color: '#1c0c02', fontWeight: 900 }}>Здорово, рыбак!</strong> Лес шумит, рыба гуляет. Выполни мои 3 поручения за день — и получишь дополнительную премию от егерской службы!»
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '6px',
                borderTop: '1px dashed rgba(120, 53, 15, 0.35)',
                fontSize: '11px',
              }}
            >
              <span style={{ color: '#592404', fontWeight: 800 }}>⏳ Новые заказы через:</span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '12px',
                  color: '#fef3c7',
                  background: 'linear-gradient(180deg, #451a03 0%, #201008 100%)',
                  padding: '2px 9px',
                  borderRadius: '6px',
                  border: '1px solid #92400e',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                }}
              >
                {timeUntilMidnight}
              </span>
            </div>
          </div>

          {/* Карточка премии за все 3 квеста дня на резной деревянной плашке */}
          <div
            style={{
              backgroundImage: "url('/assets/ui/quest_card_wood.png')",
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              padding: '16px 16px 14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
              filter: canClaimBonus
                ? 'drop-shadow(0 0 14px rgba(245, 158, 11, 0.75))'
                : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6))',
              position: 'relative',
              transition: 'filter 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ fontSize: '18px' }}>🎖️</span>
                <span
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 900,
                    color: '#fef3c7',
                    textShadow: '0 1px 3px rgba(0,0,0,0.95)',
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
                  background: 'rgba(15, 7, 3, 0.75)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(251, 191, 36, 0.35)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.9)',
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
                height: '8px',
                background: 'rgba(10, 5, 2, 0.85)',
                padding: '1.5px',
                borderRadius: '6px',
                border: '1px solid #78350f',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.9)',
              }}
            >
              {[0, 1, 2].map((idx) => {
                const isFilled = idx < completedCount;
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      borderRadius: '4px',
                      background: isFilled
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: isFilled ? '0 0 8px rgba(251, 191, 36, 0.8)' : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Награды за премию */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '11.5px', fontWeight: 900, alignItems: 'center' }}>
                <span
                  style={{
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                  }}
                >
                  +{DAILY_BONUS_REWARD.coins} <CoinIcon size={14} />
                </span>
                <span style={{ color: '#38bdf8', textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                  +{DAILY_BONUS_REWARD.gems} 💎
                </span>
                <span style={{ color: '#c084fc', textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                  +{DAILY_BONUS_REWARD.exp} XP
                </span>
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
                    background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 0 14px rgba(245, 158, 11, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.35)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  }}
                >
                  Забрать премию! 🎉
                </button>
              )}

              {allCompletedBonusClaimed && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#4ade80',
                    textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                  }}
                >
                  ✓ Награда получена
                </span>
              )}
            </div>
          </div>

          {/* Список 3 поручений Егеря */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {quests.map((quest) => {
              const badge = getDifficultyBadge(quest.difficulty);
              const progressRatio = Math.min(1, quest.currentCount / quest.targetCount);
              const progressPercent = Math.round(progressRatio * 100);

              return (
                <div
                  key={quest.id}
                  style={{
                    backgroundImage: "url('/assets/ui/quest_card_wood.png')",
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    padding: '16px 16px 14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    filter: quest.isCompleted && !quest.isClaimed
                      ? 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.6))'
                      : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.65))',
                    position: 'relative',
                  }}
                >
                  {/* Верхняя строка: Категория сложности и Награды */}
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
                          boxShadow: '0 2px 4px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.25)',
                          letterSpacing: '0.3px',
                          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Награда за заказ */}
                    <div style={{ display: 'flex', gap: '7px', fontSize: '11px', fontWeight: 900, alignItems: 'center' }}>
                      <span
                        style={{
                          color: '#fbbf24',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                        }}
                      >
                        +{quest.rewardCoins} <CoinIcon size={13} />
                      </span>
                      {quest.rewardGems && quest.rewardGems > 0 && (
                        <span style={{ color: '#38bdf8', textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                          +{quest.rewardGems} 💎
                        </span>
                      )}
                      <span style={{ color: '#c084fc', textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                        +{quest.rewardExp} XP
                      </span>
                    </div>
                  </div>

                  {/* Тело карточки: Иконка в колодце + Описание */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #2a150c 35%, #0e0603 100%)',
                        border: '1.5px solid #a16207',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0,
                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.9), 0 2px 5px rgba(0,0,0,0.6)',
                      }}
                    >
                      {quest.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 900,
                          color: '#ffffff',
                          lineHeight: 1.2,
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.95)',
                        }}
                      >
                        {quest.title}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#fed7aa',
                          marginTop: '2px',
                          lineHeight: 1.35,
                          opacity: 0.95,
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.9)',
                        }}
                      >
                        {quest.description}
                      </div>
                    </div>
                  </div>

                  {/* Прогресс-бар с заполнением */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px' }}>
                      <span style={{ color: '#d6d3d1', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                        Прогресс
                      </span>
                      <span
                        style={{
                          fontWeight: 900,
                          color: quest.isCompleted ? '#4ade80' : '#fde047',
                          textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                        }}
                      >
                        {quest.currentCount} / {quest.targetCount}
                      </span>
                    </div>

                    <div
                      style={{
                        height: '7px',
                        background: 'rgba(10, 5, 2, 0.85)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        border: '1px solid #78350f',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.9)',
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
                            ? '0 0 8px rgba(52, 211, 153, 0.7)'
                            : '0 0 8px rgba(56, 189, 248, 0.6)',
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
                          borderRadius: '8px',
                          background: 'rgba(12, 6, 3, 0.65)',
                          border: '1px solid rgba(34, 197, 94, 0.45)',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#4ade80',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.95)',
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
                          border: '1.5px solid #86efac',
                          background: 'linear-gradient(180deg, #16a34a 0%, #15803d 50%, #14532d 100%)',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 900,
                          cursor: 'pointer',
                          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
                          letterSpacing: '0.3px',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                        }}
                      >
                        Забрать награду! 🎁
                      </button>
                    ) : (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '6px',
                          borderRadius: '8px',
                          background: 'rgba(12, 6, 3, 0.65)',
                          border: '1px solid rgba(133, 77, 14, 0.4)',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          color: '#d6d3d1',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.95)',
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
            padding: '10px 16px 12px 16px',
            borderTop: '1.5px solid rgba(251, 191, 36, 0.25)',
            background: 'linear-gradient(180deg, rgba(25, 12, 6, 0.92) 0%, rgba(15, 7, 3, 0.96) 100%)',
            display: 'flex',
            justifyContent: 'center',
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: '14px',
              border: '1.5px solid #d97706',
              background: 'linear-gradient(180deg, #92400e 0%, #78350f 45%, #451a03 100%)',
              color: '#fef3c7',
              fontSize: '13.5px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
              letterSpacing: '0.4px',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
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
