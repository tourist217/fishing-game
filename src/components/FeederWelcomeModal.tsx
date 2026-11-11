import React from 'react';
import type { FeederSlotData } from '../hooks/useFeederState';
import { FEEDER_SLOTS_CONFIG } from '../hooks/useFeederState';
import { LOCATIONS } from '../locationsData';
import { AVAILABLE_BAITS } from '../hooks/useBaitState';
import { CoinIcon } from './CoinIcon';

interface FeederWelcomeModalProps {
  readyFeeders: FeederSlotData[];
  onCollect: (slotIndex: number, directSell: boolean) => void;
  onCollectAll: (directSell: boolean) => void;
  onClose: () => void;
}

export const FeederWelcomeModal: React.FC<FeederWelcomeModalProps> = ({
  readyFeeders,
  onCollectAll,
  onClose,
}) => {
  // Aggregate stats across all ready feeders
  let totalFishCount = 0;
  let totalCoins = 0;
  let totalExp = 0;
  let totalWeight = 0;

  readyFeeders.forEach((f) => {
    f.pendingCatches?.forEach((c) => {
      if (c.outcome === 'caught' && c.fish) {
        totalFishCount++;
        totalCoins += c.fish.price;
        totalExp += c.fish.exp;
        totalWeight += c.fish.weight;
      } else if (c.outcome === 'junk') {
        totalCoins += c.junkValue || 3;
        totalExp += c.junkExp || 3;
      }
    });
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(4, 9, 18, 0.9)',
        backdropFilter: 'blur(12px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '92vh',
          backgroundColor: '#122032',
          borderRadius: '26px',
          border: '2px solid rgba(56, 189, 248, 0.4)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header with celebration visual */}
        <div
          style={{
            position: 'relative',
            padding: '20px 18px 16px',
            background: 'linear-gradient(180deg, #1e3a5f 0%, #0e1e30 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '38px', marginBottom: '6px' }}>🎣✨</div>
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 900,
              color: '#f8fafc',
              letterSpacing: '0.4px',
            }}
          >
            Оффлайн-улов с фидера!
          </h2>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '12px',
              color: '#94a3b8',
              lineHeight: 1.4,
            }}
          >
            Пока вас не было в игре, на ваши донные снасти клюнула рыба!
          </p>

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#94a3b8',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Catch Content List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {readyFeeders.map((feeder) => {
            const cfg = FEEDER_SLOTS_CONFIG[feeder.slotIndex];
            const loc = LOCATIONS.find((l) => l.id === feeder.castLocationId);

            return (
              <div
                key={feeder.slotIndex}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingBottom: '6px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>
                    {cfg?.name || `Фидер #${feeder.slotIndex + 1}`}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {loc ? `${loc.icon} ${loc.name}` : 'Пруд'}
                  </span>
                </div>

                {/* Catches per hook */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {feeder.pendingCatches?.map((c, cIdx) => {
                    const bait = AVAILABLE_BAITS.find((b) => b.id === c.baitId);

                    if (c.outcome === 'caught' && c.fish) {
                      const f = c.fish;
                      const isTrophy = f.sizeCategory === 'trophy';
                      const isLegendary = f.sizeCategory === 'legendary';

                      return (
                        <div
                          key={cIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '12px',
                            background: isLegendary
                              ? 'linear-gradient(90deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.05) 100%)'
                              : isTrophy
                              ? 'linear-gradient(90deg, rgba(168, 85, 247, 0.2) 0%, rgba(126, 34, 206, 0.05) 100%)'
                              : 'rgba(255, 255, 255, 0.04)',
                            border: isLegendary
                              ? '1px solid rgba(234, 179, 8, 0.5)'
                              : isTrophy
                              ? '1px solid rgba(168, 85, 247, 0.4)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '22px' }}>{f.fish.icon || '🐟'}</span>
                            <div>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  color: isLegendary ? '#fbbf24' : isTrophy ? '#c084fc' : '#f8fafc',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                {f.fish.name}
                                {isLegendary && <span style={{ fontSize: '11px' }}>👑 Легенда</span>}
                                {isTrophy && <span style={{ fontSize: '11px' }}>🏆 Трофей</span>}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                                Крючок #{c.hookIndex + 1} ({bait?.name || 'Наживка'}) •{' '}
                                <strong style={{ color: '#e2e8f0' }}>{f.weight.toFixed(3)} кг</strong>
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '12px',
                                fontWeight: 800,
                                color: '#fbbf24',
                              }}
                            >
                              +{f.price} <CoinIcon size={13} />
                            </div>
                            <div style={{ fontSize: '10px', color: '#a855f7', fontWeight: 700 }}>
                              +{f.exp} XP
                            </div>
                          </div>
                        </div>
                      );
                    } else if (c.outcome === 'junk') {
                      return (
                        <div
                          key={cIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '12px',
                            background: 'rgba(234, 179, 8, 0.05)',
                            border: '1px solid rgba(234, 179, 8, 0.2)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>{c.junkIcon || '🪵'}</span>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: '#fbbf24' }}>
                                {c.junkName || 'Речной мусор'}
                              </div>
                              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                Крючок #{c.hookIndex + 1} • Зацепилось со дна
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700 }}>
                            +{c.junkValue || 3} 🪙
                          </div>
                        </div>
                      );
                    } else {
                      // Escaped
                      return (
                        <div
                          key={cIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px dashed rgba(239, 68, 68, 0.2)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>💨</span>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: '#f87171' }}>
                                Рыба сорвалась
                              </div>
                              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                {c.escapeReason || 'Сорвала наживку и уплыла'}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>
                            0 🪙
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary & Buttons */}
        <div
          style={{
            padding: '14px 18px',
            background: 'linear-gradient(180deg, #0e1e30 0%, #091321 100%)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Stats Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Рыбы</div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#f8fafc' }}>
                {totalFishCount} шт.
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Общий вес</div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#38bdf8' }}>
                {totalWeight.toFixed(2)} кг
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Ценность</div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 900,
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                }}
              >
                +{totalCoins} <CoinIcon size={14} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => onCollectAll(false)}
              style={{
                padding: '12px 8px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              }}
            >
              📥 В садок
            </button>

            <button
              onClick={() => onCollectAll(true)}
              style={{
                padding: '12px 8px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
              }}
            >
              💰 Продать сразу
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
