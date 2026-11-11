import React, { useState } from 'react';
import {
  FEEDER_SLOTS_CONFIG,
  FEEDER_STRENGTH_TIERS,
  OFFLINE_MINUTES_REQUIRED,
  type FeederSlotData,
} from '../hooks/useFeederState';
import { AVAILABLE_BAITS } from '../hooks/useBaitState';
import { LOCATIONS, type FishingLocation } from '../locationsData';
import { CoinIcon } from './CoinIcon';
import { GemIcon } from './GemIcon';

interface FeederModalProps {
  feeders: FeederSlotData[];
  playerLevel: number;
  coins: number;
  gems: number;
  baits: Record<string, number>;
  currentLocation: FishingLocation;
  onBuyFeeder: (slotIndex: number) => boolean;
  onUpgradeStrength: (slotIndex: number) => boolean;
  onUnlockHook: (slotIndex: number, hookNumber: 2 | 3) => boolean;
  onSetHookBait: (slotIndex: number, hookIdx: number, baitId: string | null) => void;
  onCastFeeder: (slotIndex: number, locationId: string) => boolean;
  onCancelCast: (slotIndex: number) => void;
  onOpenCatchResult: (slotIndex: number) => void;
  onClose: () => void;
}

export const FeederModal: React.FC<FeederModalProps> = ({
  feeders,
  playerLevel,
  coins,
  gems,
  baits,
  currentLocation,
  onBuyFeeder,
  onUpgradeStrength,
  onUnlockHook,
  onSetHookBait,
  onCastFeeder,
  onCancelCast,
  onOpenCatchResult,
  onClose,
}) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(currentLocation.id);
  const [pickingBaitHookIndex, setPickingBaitHookIndex] = useState<number | null>(null);

  const currentFeeder = feeders[selectedSlotIndex] || feeders[0];
  const currentSlotConfig = FEEDER_SLOTS_CONFIG[selectedSlotIndex];
  const strengthTier = FEEDER_STRENGTH_TIERS[currentFeeder.strengthLevel - 1] || FEEDER_STRENGTH_TIERS[0];
  const nextStrengthTier = FEEDER_STRENGTH_TIERS[currentFeeder.strengthLevel];

  // Available locations up to player's level
  const unlockedLocations = LOCATIONS.filter((loc) => playerLevel >= loc.levelReq);

  // Hook 2 and 3 unlock state
  const isHook2Unlocked = currentFeeder.unlockedHooks >= 2;
  const isHook3Unlocked = currentFeeder.unlockedHooks >= 3;

  // Baited hooks count
  const baitedCount = currentFeeder.hookBaits
    .slice(0, currentFeeder.unlockedHooks)
    .filter(Boolean).length;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 12, 22, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '90vh',
          backgroundColor: '#121e2d',
          borderRadius: '24px',
          border: '2px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'relative',
            padding: '14px 18px',
            background: 'linear-gradient(180deg, #1e3a5f 0%, #132438 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🎣</span>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#f8fafc',
                  letterSpacing: '0.3px',
                }}
              >
                Донный фидер
              </h2>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Оффлайн-ловля (от {OFFLINE_MINUTES_REQUIRED} минут отсутствия)
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
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

        {/* Feeder Slot Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            padding: '10px 14px',
            background: '#0d1824',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {FEEDER_SLOTS_CONFIG.map((cfg, idx) => {
            const fData = feeders[idx];
            const isSelected = selectedSlotIndex === idx;
            const hasCatch = Boolean(fData?.pendingCatches && fData.pendingCatches.length > 0);
            const inWater = Boolean(fData?.isCast && !hasCatch);

            return (
              <button
                key={cfg.slotIndex}
                onClick={() => setSelectedSlotIndex(idx)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '12px',
                  border: isSelected
                    ? '1.5px solid #38bdf8'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected
                    ? 'linear-gradient(180deg, #1e3a5f 0%, #162a42 100%)'
                    : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? '#f8fafc' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800 }}>
                  Фидер #{idx + 1}
                </div>
                <div style={{ fontSize: '9px', opacity: 0.85 }}>
                  {!fData?.isUnlocked
                    ? `Ур. ${cfg.levelReq}`
                    : hasCatch
                    ? '🎉 Улов!'
                    : inWater
                    ? '🌊 В воде'
                    : 'Готов'}
                </div>
                {hasCatch && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '1.5px solid #fff',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
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
          {/* Case 1: Slot is locked */}
          {!currentFeeder.isUnlocked ? (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '18px',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                padding: '24px 16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                }}
              >
                🔒
              </div>

              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                  {currentSlotConfig.name}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Доступен для приобретения с {currentSlotConfig.levelReq}-го уровня
                </div>
              </div>

              {playerLevel < currentSlotConfig.levelReq ? (
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  Ваш уровень: {playerLevel} (требуется {currentSlotConfig.levelReq})
                </div>
              ) : (
                <button
                  onClick={() => onBuyFeeder(selectedSlotIndex)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  Купить фидер за {currentSlotConfig.cost.toLocaleString('ru-RU')}
                  <CoinIcon size={18} />
                </button>
              )}
            </div>
          ) : (
            /* Case 2: Slot is unlocked and active */
            <>
              {/* Feeder Strength / Durability Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.4) 0%, rgba(18, 33, 53, 0.4) 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '18px' }}>💪</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                      Прочность фидера:
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#38bdf8' }}>
                      {strengthTier.strengthKg} кг
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>
                    Ур. {currentFeeder.strengthLevel}/9
                  </span>
                </div>

                <div style={{ fontSize: '10.5px', color: '#94a3b8', lineHeight: 1.35 }}>
                  🛡️ <strong style={{ color: '#cbd5e1' }}>Фидер не ломается!</strong> Суммарный вес улова не может превысить прочность — слишком крупная рыба сорвётся.
                </div>

                {nextStrengthTier ? (
                  <button
                    disabled={currentFeeder.isCast || coins < nextStrengthTier.cost}
                    onClick={() => onUpgradeStrength(selectedSlotIndex)}
                    style={{
                      marginTop: '4px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: currentFeeder.isCast
                        ? 'rgba(255, 255, 255, 0.05)'
                        : coins >= nextStrengthTier.cost
                        ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: currentFeeder.isCast
                        ? '#64748b'
                        : coins >= nextStrengthTier.cost
                        ? '#fff'
                        : '#94a3b8',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: currentFeeder.isCast || coins < nextStrengthTier.cost ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Увеличить до {nextStrengthTier.strengthKg} кг:</span>
                    <span>{nextStrengthTier.cost.toLocaleString('ru-RU')}</span>
                    <CoinIcon size={14} />
                  </button>
                ) : (
                  <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 800, textAlign: 'center' }}>
                    ⭐ Максимальная прочность бланка!
                  </div>
                )}
              </div>

              {/* Hooks & Baits Section */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                    Крючки и наживка ({baitedCount}/{currentFeeder.unlockedHooks}):
                  </span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                    1 наживка = 1 рыба
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {/* Hook 1 */}
                  {renderHookCard(0, true, 1)}

                  {/* Hook 2 */}
                  {renderHookCard(1, isHook2Unlocked, 2)}

                  {/* Hook 3 */}
                  {renderHookCard(2, isHook3Unlocked, 3)}
                </div>
              </div>

              {/* Location Selector */}
              {!currentFeeder.isCast && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc' }}>
                    Локация для заброса:
                  </div>
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    style={{
                      background: '#1a2e47',
                      color: '#f8fafc',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      fontSize: '12px',
                      fontWeight: 700,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {unlockedLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.icon} {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              {currentFeeder.pendingCatches && currentFeeder.pendingCatches.length > 0 ? (
                <button
                  onClick={() => onOpenCatchResult(selectedSlotIndex)}
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                    animation: 'pulse 2s infinite',
                  }}
                >
                  🎉 Забрать оффлайн-улов ({currentFeeder.pendingCatches.length} шт.)
                </button>
              ) : currentFeeder.isCast ? (
                <div
                  style={{
                    background: 'rgba(14, 165, 233, 0.12)',
                    borderRadius: '16px',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>
                    🌊 Фидер заброшен в воду
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                    Рыба клюнет, когда вы выйдете из игры минимум на <strong>{OFFLINE_MINUTES_REQUIRED} минут</strong>.
                    Возвращайтесь позже за уловом!
                  </div>

                  <button
                    onClick={() => onCancelCast(selectedSlotIndex)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Смотать снасть (отменить заброс)
                  </button>
                </div>
              ) : (
                <button
                  disabled={baitedCount === 0}
                  onClick={() => onCastFeeder(selectedSlotIndex, selectedLocationId)}
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    background:
                      baitedCount > 0
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: baitedCount > 0 ? '#fff' : '#64748b',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: baitedCount > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: baitedCount > 0 ? '0 4px 20px rgba(16, 185, 129, 0.3)' : 'none',
                  }}
                >
                  {baitedCount > 0
                    ? `Забросить фидер (${baitedCount} крюч.)`
                    : 'Насадите наживку на крючок'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Inline Bait Picker Modal */}
        {pickingBaitHookIndex !== null && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(8, 16, 27, 0.94)',
              backdropFilter: 'blur(6px)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                Выберите наживку на крючок #{pickingBaitHookIndex + 1}
              </h3>
              <button
                onClick={() => setPickingBaitHookIndex(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {/* Option to clear hook */}
              <div
                onClick={() => {
                  onSetHookBait(selectedSlotIndex, pickingBaitHookIndex, null);
                  setPickingBaitHookIndex(null);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px dashed rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                ❌ Снять наживку (пустой крючок)
              </div>

              {AVAILABLE_BAITS.map((bait) => {
                const count = baits[bait.id] || 0;
                const hasEnough = count > 0;

                return (
                  <div
                    key={bait.id}
                    onClick={() => {
                      if (!hasEnough) return;
                      onSetHookBait(selectedSlotIndex, pickingBaitHookIndex, bait.id);
                      setPickingBaitHookIndex(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: hasEnough ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      opacity: hasEnough ? 1 : 0.5,
                      cursor: hasEnough ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{bait.icon}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                          {bait.name}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                          В наличии: {count} шт.
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={!hasEnough}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: hasEnough
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        color: hasEnough ? '#fff' : '#64748b',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {hasEnough ? 'Выбрать' : 'Нет'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function renderHookCard(hookIdx: number, isUnlocked: boolean, hookNumber: 1 | 2 | 3) {
    const baitId = currentFeeder.hookBaits[hookIdx];
    const baitInfo = AVAILABLE_BAITS.find((b) => b.id === baitId);
    const isCast = currentFeeder.isCast;

    if (!isUnlocked) {
      if (hookNumber === 2) {
        const canAfford = coins >= 5000 && playerLevel >= 5;
        return (
          <div
            key={hookIdx}
            style={{
              borderRadius: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '10px 6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '14px' }}>🔒</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>
              Крючок #2
            </div>
            <button
              disabled={!canAfford}
              onClick={() => onUnlockHook(selectedSlotIndex, 2)}
              style={{
                padding: '4px 6px',
                borderRadius: '8px',
                background: canAfford
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: canAfford ? '#fff' : '#64748b',
                fontSize: '9.5px',
                fontWeight: 800,
                cursor: canAfford ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              5 000 <CoinIcon size={11} />
            </button>
            <span style={{ fontSize: '8.5px', color: '#64748b' }}>с 5 ур.</span>
          </div>
        );
      } else if (hookNumber === 3) {
        const canAfford = gems >= 75;
        return (
          <div
            key={hookIdx}
            style={{
              borderRadius: '12px',
              border: '1px dashed rgba(234, 179, 8, 0.3)',
              background: 'rgba(234, 179, 8, 0.03)',
              padding: '10px 6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '14px' }}>💎</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#fbbf24' }}>
              Крючок #3
            </div>
            <button
              disabled={!canAfford}
              onClick={() => onUnlockHook(selectedSlotIndex, 3)}
              style={{
                padding: '4px 6px',
                borderRadius: '8px',
                background: canAfford
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: '#fff',
                fontSize: '9.5px',
                fontWeight: 800,
                cursor: canAfford ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              75 <GemIcon size={11} />
            </button>
            <span style={{ fontSize: '8.5px', color: '#fbbf24' }}>Сразу</span>
          </div>
        );
      }
    }

    return (
      <div
        key={hookIdx}
        onClick={() => {
          if (!isCast) {
            setPickingBaitHookIndex(hookIdx);
          }
        }}
        style={{
          borderRadius: '12px',
          border: baitInfo
            ? '1.5px solid rgba(16, 185, 129, 0.4)'
            : '1px dashed rgba(255, 255, 255, 0.2)',
          background: baitInfo
            ? 'rgba(16, 185, 129, 0.08)'
            : 'rgba(255, 255, 255, 0.03)',
          padding: '10px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: isCast ? 'default' : 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>
          Крючок #{hookNumber}
        </span>

        {baitInfo ? (
          <>
            <span style={{ fontSize: '22px' }}>{baitInfo.icon}</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#f8fafc',
                maxWidth: '75px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {baitInfo.name}
            </span>
            {!isCast && (
              <span style={{ fontSize: '8.5px', color: '#38bdf8' }}>Сменить</span>
            )}
          </>
        ) : (
          <>
            <span style={{ fontSize: '20px', opacity: 0.5 }}>🪝</span>
            <span style={{ fontSize: '9.5px', color: '#64748b' }}>Пусто</span>
            {!isCast && (
              <span style={{ fontSize: '8.5px', color: '#10b981', fontWeight: 700 }}>
                + Насадить
              </span>
            )}
          </>
        )}
      </div>
    );
  }
};
