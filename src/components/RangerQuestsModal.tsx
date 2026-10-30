import React from 'react';
import type { DailyQuest } from '../types/quests';
import { triggerHaptic } from '../utils/haptics';
import { BoardHeader } from './BoardHeader';
import { CoinIcon } from './CoinIcon';
import { GemIcon } from './GemIcon';

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
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'max(10px, env(safe-area-inset-top, 10px)) 8px max(10px, env(safe-area-inset-bottom, 10px)) 8px',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* 1. СЛОЙ ФОНА: Универсальная деревянная доска */}
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
        <BoardHeader
          title="Заказы егеря"
          subtitle="Ежедневные поручения и суперприз"
        />

        {/* 3. СЛОЙ КНОПКИ ЗАКРЫТИЯ (Круглый красный крестик в правом верхнем углу) */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
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
            padding: '2px',
            boxSizing: 'border-box',
            overflowY: 'auto',
            zIndex: 10,
          }}
        >
          {/* Инфо-полоса таймера и счетчика заданий */}
          <div
            style={{
              background: 'rgba(20, 12, 6, 0.78)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              borderRadius: '12px',
              padding: '6px 10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#fef3c7', fontWeight: 800 }}>
              <span>🕒</span>
              <span>Сброс через:</span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 900 }}>{timeUntilMidnight}</span>
            </div>
            <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#facc15' }}>
              Выполнено: {completedCount} / 3
            </div>
          </div>

          {/* Карточка Суперприза */}
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(35, 20, 10, 0.85) 0%, rgba(20, 10, 5, 0.9) 100%)',
              border: '1.5px solid #d97706',
              borderRadius: '14px',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.55), inset 0 1px 2px rgba(254, 240, 138, 0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>🎁</span>
                <span style={{ fontSize: '12px', fontWeight: 900, color: '#fef08a' }}>
                  Суперприз за 3 заказа
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#fbbf24' }}>
                  +150 <CoinIcon size={13} />
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#38bdf8' }}>
                  +10 <GemIcon size={13} />
                </span>
                <span style={{ color: '#a78bfa' }}>
                  +250 XP
                </span>
              </div>
            </div>

            {canClaimBonus ? (
              <button
                onClick={() => {
                  onClaimDailyBonus();
                  triggerHaptic('notification');
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #86efac',
                  background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(34, 197, 94, 0.8), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>🎁</span>
                <span>Забрать суперприз дня!</span>
              </button>
            ) : allCompletedBonusClaimed ? (
              <div
                style={{
                  padding: '6px',
                  borderRadius: '10px',
                  background: 'rgba(20, 10, 5, 0.6)',
                  border: '1px solid rgba(74, 222, 128, 0.4)',
                  color: '#4ade80',
                  fontWeight: 800,
                  fontSize: '11px',
                  textAlign: 'center',
                }}
              >
                ✓ Суперприз дня получен!
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '5px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (completedCount / 3) * 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #facc15 0%, #22c55e 100%)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            )}
          </div>

          {/* 3 карточки заказов */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1 }}>
            {quests.slice(0, 3).map((quest, idx) => {
              const diffLabel =
                quest.difficulty === 'easy' ? 'Лёгкий' : quest.difficulty === 'medium' ? 'Средний' : 'Сложный';
              const diffColor =
                quest.difficulty === 'easy' ? '#4ade80' : quest.difficulty === 'medium' ? '#facc15' : '#f87171';
              const progressPct = quest.targetCount > 0 ? Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100)) : 0;

              return (
                <div
                  key={quest.id || idx}
                  style={{
                    background: 'rgba(25, 14, 7, 0.82)',
                    border: '1px solid rgba(251, 191, 36, 0.25)',
                    borderRadius: '13px',
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  {/* Верхняя строка карточки: название и сложность */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#fef3c7', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>{quest.icon || '🎯'}</span>
                      <span>{quest.title}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: diffColor,
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        border: `1px solid ${diffColor}44`,
                      }}
                    >
                      {diffLabel}
                    </span>
                  </div>

                  {/* Описание задания */}
                  <div style={{ fontSize: '10.5px', color: '#cbd5e1', lineHeight: 1.25 }}>
                    {quest.description}
                  </div>

                  {/* Прогресс-бар задания */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        flex: 1,
                        height: '5px',
                        background: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${progressPct}%`,
                          height: '100%',
                          background: quest.isCompleted ? '#22c55e' : '#38bdf8',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: quest.isCompleted ? '#4ade80' : '#94a3b8' }}>
                      {quest.currentCount} / {quest.targetCount}
                    </span>
                  </div>

                  {/* Награды и кнопка действия */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '10.5px', fontWeight: 800 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#fbbf24' }}>
                        +{quest.rewardCoins} <CoinIcon size={12} />
                      </span>
                      {quest.rewardGems ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#38bdf8' }}>
                          +{quest.rewardGems} <GemIcon size={12} />
                        </span>
                      ) : null}
                      <span style={{ color: '#a78bfa' }}>
                        +{quest.rewardExp} XP
                      </span>
                    </div>

                    {quest.isClaimed ? (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#4ade80',
                          background: 'rgba(34, 197, 94, 0.15)',
                          border: '1px solid rgba(74, 222, 128, 0.35)',
                          borderRadius: '8px',
                          padding: '3px 8px',
                        }}
                      >
                        ✓ Получено
                      </span>
                    ) : quest.isCompleted ? (
                      <button
                        onClick={() => {
                          onClaimQuestReward(quest.id);
                          triggerHaptic('notification');
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          border: '1px solid #86efac',
                          background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '10.5px',
                          cursor: 'pointer',
                          boxShadow: '0 0 10px rgba(34, 197, 94, 0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>Забрать</span>
                        <span>🎁</span>
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 700,
                          color: '#94a3b8',
                          background: 'rgba(0, 0, 0, 0.35)',
                          padding: '3px 7px',
                          borderRadius: '6px',
                        }}
                      >
                        В процессе
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
