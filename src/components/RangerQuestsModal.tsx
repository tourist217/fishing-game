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
    progressTop: '52.0%',
    buttonTop: '51.7%',
  },
  {
    progressTop: '65.0%',
    buttonTop: '64.8%',
  },
  {
    progressTop: '78.1%',
    buttonTop: '77.9%',
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
      {/* Главный стенд объявлений Егеря: точный Вариант В (Экспедиционный Стенд) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(94vh * 0.558, 100vw - 16px, 430px)',
          aspectRatio: '768 / 1376',
          maxHeight: '94vh',
          backgroundImage: "url('/assets/ui/ranger_quests_variant_c.jpg')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'drop-shadow(0 16px 40px rgba(0, 0, 0, 0.9))',
        }}
      >
        {/* Кнопка закрытия (X) в правом верхнем углу */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          aria-label="Закрыть"
          style={{
            position: 'absolute',
            left: '82.5%',
            top: '10.5%',
            width: '12.0%',
            height: '7.0%',
            borderRadius: '50%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        />

        {/* Живой таймер справа от надписи «Новые заказы:» */}
        <div
          style={{
            position: 'absolute',
            left: '58.2%',
            top: '26.8%',
            width: '18.0%',
            height: '2.8%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            color: '#3d1a03',
            fontWeight: 900,
            fontSize: 'clamp(11px, 2.3vw, 15px)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.4px',
            pointerEvents: 'none',
          }}
        >
          {timeUntilMidnight}
        </div>

        {/* Живой прогресс суперприза */}
        <div
          style={{
            position: 'absolute',
            left: '36.0%',
            top: '32.1%',
            width: '28.0%',
            height: '2.8%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fef3c7',
            fontWeight: 900,
            fontSize: 'clamp(11px, 2.3vw, 14px)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.95)',
            pointerEvents: 'none',
          }}
        >
          Суперприз ({completedCount}/3)
        </div>

        {/* Кнопка забрать суперприз дня, когда выполнены все 3 заказа */}
        {canClaimBonus && (
          <button
            onClick={() => {
              onClaimDailyBonus();
              triggerHaptic('notification');
            }}
            style={{
              position: 'absolute',
              left: '26.0%',
              top: '35.5%',
              width: '48.0%',
              height: '4.8%',
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
            <span>Забрать суперприз!</span>
          </button>
        )}

        {allCompletedBonusClaimed && (
          <div
            style={{
              position: 'absolute',
              left: '28.0%',
              top: '35.8%',
              width: '44.0%',
              height: '4.2%',
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
            <span>Суперприз получен</span>
          </div>
        )}

        {/* 3 карточки заданий Егеря */}
        {quests.slice(0, 3).map((quest, idx) => {
          const config = QUEST_CONFIGS[idx];
          const progressRatio = Math.min(1, quest.currentCount / quest.targetCount);
          const progressPercent = Math.round(progressRatio * 100);

          return (
            <React.Fragment key={quest.id || idx}>
              {/* Прогресс-бар поверх углубления в дереве */}
              <div
                style={{
                  position: 'absolute',
                  left: '34.5%',
                  top: config.progressTop,
                  width: '25.4%',
                  height: '2.9%',
                  background: '#1a0e06',
                  borderRadius: '14px',
                  border: '1px solid rgba(217, 119, 6, 0.6)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.9)',
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
                      : 'linear-gradient(180deg, #34d399 0%, #10b981 60%, #059669 100%)',
                    borderRadius: '12px',
                    boxShadow: quest.isCompleted
                      ? '0 0 10px rgba(74, 222, 128, 0.85)'
                      : '0 0 8px rgba(52, 211, 153, 0.8)',
                    transition: 'width 0.3s ease',
                  }}
                />

                {/* Числа прогресса (1/2) поверх заливки */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    textAlign: 'center',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: 'clamp(9.5px, 2.1vw, 12.5px)',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.95)',
                    letterSpacing: '0.4px',
                    zIndex: 2,
                  }}
                >
                  ({quest.currentCount}/{quest.targetCount})
                </div>
              </div>

              {/* Кнопка действия (интерактивная при завершении или получении) */}
              {quest.isClaimed ? (
                <div
                  style={{
                    position: 'absolute',
                    left: '61.85%',
                    top: config.buttonTop,
                    width: '21.22%',
                    height: '3.34%',
                    borderRadius: '10px',
                    background: 'rgba(20, 10, 5, 0.85)',
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
                    position: 'absolute',
                    left: '61.85%',
                    top: config.buttonTop,
                    width: '21.22%',
                    height: '3.34%',
                    borderRadius: '10px',
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
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  Забрать! 🎁
                </button>
              ) : null /* В процессе уже нарисовано в самом арте Варианта В */}
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
            left: '21.8%',
            top: '86.5%',
            width: '56.4%',
            height: '7.5%',
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
