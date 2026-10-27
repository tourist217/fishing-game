import React from 'react';
import type { TutorialStep } from '../hooks/useTutorial';

interface TutorialGuideProps {
  step: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
}

export const TutorialGuide: React.FC<TutorialGuideProps> = ({ step, onNext, onSkip }) => {
  if (step === 'completed') return null;

  // Конфигурация каждого шага
  const getStepConfig = () => {
    switch (step) {
      case 'welcome_cast':
        return {
          title: 'Старый Егерь',
          text: 'Здорово, рыбак! Я здешний егерь. Давай забросим удочку и поймаем твою первую рыбу! Жми «На рыбалку».',
          arrowPos: 'bottom' as const,
          actionLabel: undefined,
          boxStyle: {
            bottom: 'calc(168px + env(safe-area-inset-bottom, 0px))',
            left: '12px',
            right: '12px',
          },
        };
      case 'cast_rod':
        return {
          title: 'Старый Егерь',
          text: 'Червяк уже на крючке! Нажимай «Забросить удочку» и внимательно следи за поплавком.',
          arrowPos: 'bottom' as const,
          actionLabel: undefined,
          boxStyle: {
            bottom: 'calc(175px + env(safe-area-inset-bottom, 0px))',
            left: '12px',
            right: '12px',
          },
        };
      case 'reeling_guide':
        return {
          title: 'Старый Егерь',
          text: 'Клюёт! Зажимай и держи кнопку «ТЯНУТЬ!». Держи натяжение лески в зелёной зоне!',
          arrowPos: 'bottom' as const,
          actionLabel: undefined,
          boxStyle: {
            bottom: 'calc(175px + env(safe-area-inset-bottom, 0px))',
            left: '12px',
            right: '12px',
          },
        };
      case 'open_keepnet':
        return {
          title: 'Старый Егерь',
          text: 'Красота, первая рыба в садке! 🐟 Жми на иконку «Садок» внизу, чтобы продать её.',
          arrowPos: 'bottom' as const,
          actionLabel: 'Открыть садок 🧺',
          boxStyle: {
            bottom: 'calc(75px + env(safe-area-inset-bottom, 0px))',
            left: '12px',
            right: '12px',
          },
        };
      case 'sell_fish':
        return {
          title: 'Старый Егерь',
          text: 'Здесь твой улов. Нажми «Продать всё» наверху, чтобы получить монеты на первые снасти!',
          arrowPos: 'top' as const,
          actionLabel: undefined,
          boxStyle: {
            bottom: 'calc(75px + env(safe-area-inset-bottom, 0px))',
            left: '12px',
            right: '12px',
          },
        };
      case 'go_to_shop':
        return {
          title: 'Старый Егерь',
          text: 'Отличная сделка! Держи ещё +10 монет 🪙 от меня в подарок. Теперь заглянем в Магазин за наживками!',
          arrowPos: 'bottom' as const,
          actionLabel: 'В магазин 🛒',
          boxStyle: {
            bottom: 'calc(75px + env(safe-area-inset-bottom, 0px))',
            left: '12px',
            right: '12px',
          },
        };
      case 'buy_bait':
        return {
          title: 'Старый Егерь',
          text: 'Здесь продаются черви 🪱 и другие наживки. Всегда держи запас, чтобы не остаться без клёва!',
          arrowPos: 'top' as const,
          actionLabel: 'Понятно, дальше! 👍',
          boxStyle: {
            bottom: 'calc(75px + env(safe-area-inset-bottom, 0px))',
            left: '12px',
            right: '12px',
          },
        };
      case 'energy_info':
        return {
          title: 'Старый Егерь',
          text: 'Обрати внимание на молнию ⚡: на каждую рыбалку тратится энергия. Она восстанавливается со временем, а ещё можно выпить чай ☕ у костра!',
          arrowPos: 'top' as const,
          actionLabel: 'Понятно, дальше! 👍',
          boxStyle: {
            bottom: 'calc(75px + env(safe-area-inset-bottom, 0px))',
            left: '12px',
            right: '12px',
          },
        };
      case 'map_info':
        return {
          title: 'Старый Егерь',
          text: 'И главное — Карта 🗺️! Здесь открываются новые реки и озёра по мере роста твоего уровня: от лесных озёр до великой Волги!',
          arrowPos: 'bottom' as const,
          actionLabel: 'Завершить обучение 🎣',
          boxStyle: {
            bottom: 'calc(75px + env(safe-area-inset-bottom, 0px))',
            left: '12px',
            right: '12px',
          },
        };
      default:
        return null;
    }
  };

  const config = getStepConfig();
  if (!config) return null;

  return (
    <>
      <style>{`
        @keyframes tutorialBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes tutorialBounceUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes tutorialGlowPulse {
          0%, 100% { box-shadow: 0 0 16px rgba(74, 222, 128, 0.4), 0 8px 32px rgba(0,0,0,0.6); }
          50% { box-shadow: 0 0 28px rgba(74, 222, 128, 0.8), 0 8px 32px rgba(0,0,0,0.8); }
        }
      `}</style>

      {/* Панель подсказки Егеря */}
      <div
        style={{
          position: 'fixed',
          ...config.boxStyle,
          zIndex: 9999,
          pointerEvents: 'auto',
          animation: 'tutorialGlowPulse 2.5s infinite ease-in-out',
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '18px',
          border: '2px solid #22c55e',
          padding: '12px 14px',
          boxSizing: 'border-box',
          maxWidth: '420px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {/* Аватарка егеря */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid #fbbf24',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              background: '#091325',
            }}
          >
            <img
              src="/assets/icons/ranger_quests.png"
              alt="Старый Егерь"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Текст и управление */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#fbbf24', letterSpacing: '0.5px' }}>
                {config.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSkip();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '2px 4px',
                }}
              >
                Пропустить ✕
              </button>
            </div>

            <p style={{ margin: '0 0 8px 0', fontSize: '13px', lineHeight: '1.35', color: '#f1f5f9', fontWeight: 600 }}>
              {config.text}
            </p>

            {config.actionLabel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                  border: '1px solid #86efac',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 800,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)',
                }}
              >
                {config.actionLabel}
              </button>
            )}
          </div>
        </div>

        {/* Анимированная стрелка-указатель вниз */}
        {config.arrowPos === 'bottom' && !config.actionLabel && (
          <div
            style={{
              position: 'absolute',
              bottom: '-24px',
              left: '50%',
              marginLeft: '-14px',
              fontSize: '24px',
              animation: 'tutorialBounce 0.9s infinite ease-in-out',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            👇
          </div>
        )}

        {/* Анимированная стрелка-указатель вверх */}
        {config.arrowPos === 'top' && (
          <div
            style={{
              position: 'absolute',
              top: '-24px',
              left: '50%',
              marginLeft: '-14px',
              fontSize: '24px',
              animation: 'tutorialBounceUp 0.9s infinite ease-in-out',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            👆
          </div>
        )}
      </div>
    </>
  );
};
