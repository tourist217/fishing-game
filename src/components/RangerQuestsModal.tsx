import React from 'react';
import type { DailyQuest } from '../types/quests';
import { triggerHaptic } from '../utils/haptics';

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

const QUEST_CONFIGS = [
  {
    titleTop: '45.8%',
    progressTop: '50.5%',
    buttonTop: '50.5%',
  },
  {
    titleTop: '60.0%',
    progressTop: '64.7%',
    buttonTop: '64.7%',
  },
  {
    titleTop: '74.2%',
    progressTop: '78.8%',
    buttonTop: '78.8%',
  },
];

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
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'max(10px, env(safe-area-inset-top, 10px)) 8px max(10px, env(safe-area-inset-bottom, 10px)) 8px',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Главный стенд объявлений Егеря: точный Вариант 1 (Каноничный Таёжный Кордон) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(94vh * 0.558, 100vw - 16px, 430px)',
          aspectRatio: '768 / 1376',
          maxHeight: '94vh',
          backgroundImage: "url('/assets/ui/ranger_quests_variant1.jpg')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'drop-shadow(0 16px 40px rgba(0, 0, 0, 0.9))',
        }}
      >
        {/* Кнопка закрытия (X) в правом верхнем углу резной дубовой шапки */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          aria-label="Закрыть"
          style={{
            position: 'absolute',
            left: '82.0%',
            top: '6.0%',
            width: '11.5%',
            height: '6.4%',
            borderRadius: '50%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        />

        {/* Живой динамический таймер на пергаментном свитке */}
        <div
          style={{
            position: 'absolute',
            left: '21.0%',
            top: '22.8%',
            width: '58.0%',
            height: '3.8%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: 'linear-gradient(180deg, #c7a473 0%, #dbb988 100%)',
            borderRadius: '20px',
            boxShadow: 'inset 0 1px 3px rgba(60, 30, 10, 0.45)',
            color: '#3b1d07',
            fontWeight: 900,
            fontSize: 'clamp(11px, 2.5vw, 15px)',
            letterSpacing: '0.2px',
            pointerEvents: 'none',
          }}
        >
          <span>⏳</span>
          <span>Новые заказы:</span>
          <span style={{ color: '#1a0902', fontWeight: 900, fontFamily: 'monospace' }}>
            {timeUntilMidnight}
          </span>
        </div>

        {/* Карточка премии Grand Prize ({completedCount}/3) */}
        <div
          style={{
            position: 'absolute',
            left: '32.0%',
            top: '30.1%',
            width: '36.0%',
            height: '3.1%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #78350f 0%, #451a03 100%)',
            borderRadius: '12px',
            border: '1px solid #d97706',
            color: '#fef3c7',
            fontWeight: 900,
            fontSize: 'clamp(10px, 2.2vw, 13px)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.6)',
            textShadow: '0 1px 2px rgba(0,0,0,0.9)',
            letterSpacing: '0.3px',
            pointerEvents: 'none',
          }}
        >
          Grand Prize ({completedCount}/3)
        </div>

        {/* Кнопка забрать премию дня, когда выполнены все 3 заказа */}
        {canClaimBonus && (
          <button
            onClick={() => {
              onClaimDailyBonus();
              triggerHaptic('notification');
            }}
            style={{
              position: 'absolute',
              left: '25.0%',
              top: '35.0%',
              width: '50.0%',
              height: '5.2%',
              borderRadius: '14px',
              border: '2px solid #86efac',
              background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: 'clamp(12px, 2.8vw, 15px)',
              cursor: 'pointer',
              boxShadow: '0 0 24px rgba(34, 197, 94, 0.95), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              zIndex: 10,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span>🎁</span>
            <span>Забрать премию!</span>
          </button>
        )}

        {allCompletedBonusClaimed && (
          <div
            style={{
              position: 'absolute',
              left: '27.0%',
              top: '35.2%',
              width: '46.0%',
              height: '4.6%',
              borderRadius: '12px',
              background: 'rgba(20, 10, 5, 0.85)',
              border: '1.5px solid #22c55e',
              color: '#4ade80',
              fontWeight: 900,
              fontSize: 'clamp(11px, 2.5vw, 14px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.7)',
              zIndex: 10,
            }}
          >
            <span>✓</span>
            <span>Премия получена</span>
          </div>
        )}

        {/* 3 карточки заданий Егеря */}
        {quests.slice(0, 3).map((quest, idx) => {
          const config = QUEST_CONFIGS[idx];
          const progressRatio = Math.min(1, quest.currentCount / quest.targetCount);
          const progressPercent = Math.round(progressRatio * 100);

          return (
            <React.Fragment key={quest.id || idx}>
              {/* Заголовок квеста */}
              <div
                style={{
                  position: 'absolute',
                  left: '38.5%',
                  top: config.titleTop,
                  width: '43.0%',
                  height: '3.8%',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#fffef0',
                  fontWeight: 900,
                  fontSize: 'clamp(12px, 2.8vw, 17px)',
                  lineHeight: 1.15,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 10px rgba(0, 0, 0, 0.7)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  pointerEvents: 'none',
                }}
              >
                {quest.title}
              </div>

              {/* Прогресс-бар в глубоком латунно-деревянном пазу с ярким неоновым заполнением */}
              <div
                style={{
                  position: 'absolute',
                  left: '38.4%',
                  top: config.progressTop,
                  width: '22.1%',
                  height: '3.85%',
                  background: '#2b1407',
                  borderRadius: '14px',
                  border: '1.5px solid #d97706',
                  boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.85), 0 1px 2px rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {/* Заполнение прогресс-бара */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${progressPercent}%`,
                    background: quest.isCompleted
                      ? 'linear-gradient(180deg, #4ade80 0%, #16a34a 60%, #15803d 100%)'
                      : 'linear-gradient(180deg, #38bdf8 0%, #0284c7 60%, #0369a1 100%)',
                    borderRadius: '12px',
                    boxShadow: quest.isCompleted
                      ? '0 0 10px rgba(74, 222, 128, 0.8)'
                      : '0 0 10px rgba(56, 189, 248, 0.8)',
                    transition: 'width 0.3s ease',
                  }}
                />

                {/* Текст прогресса (1/2) поверх заливки */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    textAlign: 'center',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: 'clamp(10px, 2.2vw, 13px)',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.95)',
                    letterSpacing: '0.4px',
                    zIndex: 2,
                  }}
                >
                  ({quest.currentCount}/{quest.targetCount})
                </div>
              </div>

              {/* Кнопка состояния квеста */}
              <div
                style={{
                  position: 'absolute',
                  left: '61.2%',
                  top: config.buttonTop,
                  width: '19.8%',
                  height: '3.85%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {quest.isClaimed ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '12px',
                      background: 'rgba(20, 10, 5, 0.8)',
                      border: '1px solid rgba(74, 222, 128, 0.45)',
                      color: '#4ade80',
                      fontWeight: 900,
                      fontSize: 'clamp(9px, 2.0vw, 12px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                    }}
                  >
                    ✓ Готово
                  </div>
                ) : quest.isCompleted ? (
                  <button
                    onClick={() => {
                      onClaimQuestReward(quest.id);
                      triggerHaptic('notification');
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '12px',
                      border: '1.5px solid #86efac',
                      background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: 'clamp(9.5px, 2.1vw, 12.5px)',
                      cursor: 'pointer',
                      boxShadow: '0 0 14px rgba(34, 197, 94, 0.9), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    Забрать! 🎁
                  </button>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '12px',
                      border: '1.5px solid #a3e635',
                      background: 'linear-gradient(180deg, #65a30d 0%, #4d7c0f 50%, #3f6212 100%)',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: 'clamp(9px, 2.0vw, 12px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.35)',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.9)',
                    }}
                  >
                    В процессе
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}

        {/* Нижняя кнопка возврата на базу (Вернуться на базу) */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          aria-label="Вернуться на базу"
          style={{
            position: 'absolute',
            left: '23.8%',
            top: '90.2%',
            width: '52.4%',
            height: '7.0%',
            borderRadius: '20px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        />
      </div>
    </div>
  );
};
