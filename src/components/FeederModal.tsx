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

  const hasCatch = Boolean(currentFeeder.pendingCatches && currentFeeder.pendingCatches.length > 0);

  // Select card background variant matching tab index and locked/unlocked state
  const bgImageSrc = `/assets/ui/feeder_card_tab${selectedSlotIndex}_${
    currentFeeder.isUnlocked ? 'clean' : 'locked'
  }.png`;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(4, 9, 18, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          aspectRatio: '1024 / 764',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
          filter: 'drop-shadow(0 25px 60px rgba(0, 0, 0, 0.85))',
        }}
      >
        {/* Background Card with user's custom artwork */}
        <img
          src={bgImageSrc}
          alt="Окно фидера"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* 1. Invisible Close Button over top-right wooden button */}
        <button
          onClick={onClose}
          aria-label="Закрыть"
          style={{
            position: 'absolute',
            top: '2%',
            right: '2%',
            width: '11%',
            height: '14%',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 5,
            outline: 'none',
            transition: 'transform 0.1s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* 2. Top Title and Subtitle */}
        <div
          style={{
            position: 'absolute',
            top: '4.5%',
            left: '18%',
            right: '18%',
            height: '14%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(15px, 3.8vw, 21px)',
              fontWeight: 900,
              color: '#fef08a',
              letterSpacing: '0.8px',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(251, 191, 36, 0.5)',
              textTransform: 'uppercase',
              lineHeight: 1.1,
            }}
          >
            Донный фидер
          </div>
          <div
            style={{
              fontSize: 'clamp(8.5px, 2vw, 11px)',
              fontWeight: 700,
              color: '#e2e8f0',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.85)',
              marginTop: '2px',
              opacity: 0.9,
            }}
          >
            Оффлайн-ловля (от {OFFLINE_MINUTES_REQUIRED} минут отсутствия)
          </div>
        </div>

        {/* 3. Three Top Tabs: Tab 1, Tab 2, Tab 3 */}
        {FEEDER_SLOTS_CONFIG.map((cfg, idx) => {
          const fData = feeders[idx];
          const isSelected = selectedSlotIndex === idx;
          const slotCatch = Boolean(fData?.pendingCatches && fData.pendingCatches.length > 0);
          const inWater = Boolean(fData?.isCast && !slotCatch);

          // Horizontal bounds per tab based on artwork
          const leftPercent = idx === 0 ? '9.4%' : idx === 1 ? '37.1%' : '63.5%';
          const widthPercent = idx === 0 ? '27.3%' : '26.0%';

          return (
            <button
              key={cfg.slotIndex}
              onClick={() => setSelectedSlotIndex(idx)}
              style={{
                position: 'absolute',
                top: '23.3%',
                left: leftPercent,
                width: widthPercent,
                height: '13.1%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                zIndex: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px 4px',
                outline: 'none',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(11px, 2.7vw, 15px)',
                  fontWeight: 900,
                  color: isSelected ? '#ffffff' : '#cbd5e1',
                  textShadow: isSelected
                    ? '0 0 10px rgba(56, 189, 248, 0.9), 0 2px 4px rgba(0, 0, 0, 0.9)'
                    : '0 1px 4px rgba(0, 0, 0, 0.9)',
                  lineHeight: 1.15,
                  letterSpacing: '0.3px',
                }}
              >
                Фидер #{idx + 1}
              </div>
              <div
                style={{
                  fontSize: 'clamp(7.5px, 1.8vw, 10px)',
                  fontWeight: 800,
                  color: isSelected
                    ? slotCatch
                      ? '#4ade80'
                      : inWater
                      ? '#38bdf8'
                      : '#fef08a'
                    : '#94a3b8',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
                  marginTop: '1px',
                }}
              >
                {!fData?.isUnlocked
                  ? `🔒 ${cfg.levelReq} ур.`
                  : slotCatch
                  ? '🎉 УЛОВ!'
                  : inWater
                  ? '🌊 В воде'
                  : 'Готов'}
              </div>
            </button>
          );
        })}

        {/* 4. Center Inner Board Content */}
        {!currentFeeder.isUnlocked ? (
          /* CASE 1: Locked Slot (Lock is in card artwork) */
          <>
            {/* Text description under the lock */}
            <div
              style={{
                position: 'absolute',
                top: '64.5%',
                left: '15%',
                right: '15%',
                height: '13%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(11px, 2.6vw, 14px)',
                  fontWeight: 900,
                  color: '#f8fafc',
                  textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)',
                }}
              >
                {currentSlotConfig.name}
              </div>
              <div
                style={{
                  fontSize: 'clamp(8.5px, 2vw, 11px)',
                  color: playerLevel < currentSlotConfig.levelReq ? '#f87171' : '#cbd5e1',
                  fontWeight: 700,
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)',
                  marginTop: '2px',
                }}
              >
                {playerLevel < currentSlotConfig.levelReq
                  ? `Требуется ${currentSlotConfig.levelReq} уровень (у вас ${playerLevel})`
                  : `Доступен для покупки за ${currentSlotConfig.cost.toLocaleString('ru-RU')} монет`}
              </div>
            </div>

            {/* Bottom Brown Button for Buying */}
            <button
              disabled={playerLevel < currentSlotConfig.levelReq || coins < currentSlotConfig.cost}
              onClick={() => onBuyFeeder(selectedSlotIndex)}
              style={{
                position: 'absolute',
                top: '78.8%',
                left: '29.5%',
                width: '41.5%',
                height: '9.8%',
                background: 'transparent',
                border: 'none',
                cursor:
                  playerLevel < currentSlotConfig.levelReq || coins < currentSlotConfig.cost
                    ? 'not-allowed'
                    : 'pointer',
                zIndex: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                outline: 'none',
                transition: 'transform 0.1s ease',
                opacity: playerLevel < currentSlotConfig.levelReq ? 0.6 : 1,
              }}
              onMouseDown={(e) => {
                if (playerLevel >= currentSlotConfig.levelReq) {
                  e.currentTarget.style.transform = 'scale(0.96)';
                }
              }}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={(e) => {
                if (playerLevel >= currentSlotConfig.levelReq) {
                  e.currentTarget.style.transform = 'scale(0.96)';
                }
              }}
              onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span
                style={{
                  fontSize: 'clamp(10.5px, 2.5vw, 14px)',
                  fontWeight: 900,
                  color: '#fff',
                  textShadow: '0 2px 5px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  letterSpacing: '0.3px',
                }}
              >
                {playerLevel < currentSlotConfig.levelReq ? (
                  `🔒 С ${currentSlotConfig.levelReq} УРОВНЯ`
                ) : (
                  <>
                    КУПИТЬ ЗА {currentSlotConfig.cost.toLocaleString('ru-RU')}
                    <CoinIcon size={15} />
                  </>
                )}
              </span>
            </button>
          </>
        ) : (
          /* CASE 2: Unlocked Slot (Clean board with controls) */
          <>
            <div
              style={{
                position: 'absolute',
                top: '40.5%',
                left: '12%',
                right: '12%',
                height: '37.5%',
                overflowY: 'auto',
                padding: '4px 6px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                zIndex: 3,
                gap: '4px',
              }}
            >
              {/* Row 1: Strength & Upgrade */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(15, 23, 42, 0.65)',
                  borderRadius: '10px',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  padding: '4px 8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: 'clamp(12px, 2.8vw, 16px)' }}>💪</span>
                  <div>
                    <span
                      style={{
                        fontSize: 'clamp(9px, 2.2vw, 12px)',
                        fontWeight: 800,
                        color: '#f8fafc',
                      }}
                    >
                      Прочность:{' '}
                    </span>
                    <span
                      style={{
                        fontSize: 'clamp(10px, 2.4vw, 13px)',
                        fontWeight: 900,
                        color: '#38bdf8',
                      }}
                    >
                      {strengthTier.strengthKg} кг
                    </span>
                    <span style={{ fontSize: 'clamp(7.5px, 1.8vw, 9.5px)', color: '#94a3b8', marginLeft: '4px' }}>
                      ({currentFeeder.strengthLevel}/9)
                    </span>
                  </div>
                </div>

                {nextStrengthTier ? (
                  <button
                    disabled={currentFeeder.isCast || coins < nextStrengthTier.cost}
                    onClick={() => onUpgradeStrength(selectedSlotIndex)}
                    style={{
                      padding: '3px 7px',
                      borderRadius: '8px',
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
                      fontSize: 'clamp(8px, 1.9vw, 10px)',
                      fontWeight: 800,
                      cursor:
                        currentFeeder.isCast || coins < nextStrengthTier.cost
                          ? 'not-allowed'
                          : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <span>+{nextStrengthTier.strengthKg} кг:</span>
                    <span>{nextStrengthTier.cost.toLocaleString('ru-RU')}</span>
                    <CoinIcon size={11} />
                  </button>
                ) : (
                  <span style={{ fontSize: '9px', color: '#10b981', fontWeight: 800 }}>
                    ⭐ Макс
                  </span>
                )}
              </div>

              {/* Row 2: 3 Hooks & Baits */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                }}
              >
                {renderHookCard(0, true, 1)}
                {renderHookCard(1, isHook2Unlocked, 2)}
                {renderHookCard(2, isHook3Unlocked, 3)}
              </div>

              {/* Row 3: Location Selector */}
              {!currentFeeder.isCast ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(15, 23, 42, 0.55)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '3px 8px',
                  }}
                >
                  <span style={{ fontSize: 'clamp(8.5px, 2vw, 11px)', fontWeight: 800, color: '#f8fafc' }}>
                    Водоём:
                  </span>
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    style={{
                      background: '#122538',
                      color: '#f8fafc',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      fontSize: 'clamp(8px, 1.9vw, 10.5px)',
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
              ) : (
                <div
                  style={{
                    fontSize: 'clamp(8px, 1.9vw, 10px)',
                    color: '#94a3b8',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  🛡️ Заброшен на оффлайн: рыба клюнет через {OFFLINE_MINUTES_REQUIRED} мин отсутствия
                </div>
              )}
            </div>

            {/* Bottom Brown Button for Actions */}
            <button
              disabled={!hasCatch && !currentFeeder.isCast && baitedCount === 0}
              onClick={() => {
                if (hasCatch) {
                  onOpenCatchResult(selectedSlotIndex);
                } else if (currentFeeder.isCast) {
                  onCancelCast(selectedSlotIndex);
                } else if (baitedCount > 0) {
                  onCastFeeder(selectedSlotIndex, selectedLocationId);
                }
              }}
              style={{
                position: 'absolute',
                top: '78.8%',
                left: '29.5%',
                width: '41.5%',
                height: '9.8%',
                background: 'transparent',
                border: 'none',
                cursor:
                  !hasCatch && !currentFeeder.isCast && baitedCount === 0
                    ? 'not-allowed'
                    : 'pointer',
                zIndex: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                transition: 'transform 0.1s ease',
                opacity: !hasCatch && !currentFeeder.isCast && baitedCount === 0 ? 0.6 : 1,
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
              onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span
                style={{
                  fontSize: 'clamp(9.5px, 2.3vw, 13px)',
                  fontWeight: 900,
                  color: '#fff',
                  textShadow: '0 2px 5px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.7)',
                  textAlign: 'center',
                  lineHeight: 1.15,
                  letterSpacing: '0.3px',
                }}
              >
                {hasCatch
                  ? `🎉 ЗАБРАТЬ УЛОВ (${currentFeeder.pendingCatches?.length})`
                  : currentFeeder.isCast
                  ? 'СМОТАТЬ СНАСТЬ ↩'
                  : baitedCount > 0
                  ? `ЗАБРОСИТЬ (${baitedCount} КРЮЧ.)`
                  : 'НАСАДИТЕ НАЖИВКУ'}
              </span>
            </button>
          </>
        )}

        {/* 5. Inline Bait Picker Modal Drawer */}
        {pickingBaitHookIndex !== null && (
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '8%',
              right: '8%',
              bottom: '8%',
              background: 'rgba(8, 16, 27, 0.96)',
              borderRadius: '20px',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.9)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              padding: '12px 14px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '6px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#f8fafc' }}>
                Наживка на крючок #{pickingBaitHookIndex + 1}
              </h3>
              <button
                onClick={() => setPickingBaitHookIndex(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '2px 6px',
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
                gap: '6px',
              }}
            >
              {/* Option to clear hook */}
              <div
                onClick={() => {
                  onSetHookBait(selectedSlotIndex, pickingBaitHookIndex, null);
                  setPickingBaitHookIndex(null);
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px dashed rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  fontSize: '11px',
                  fontWeight: 800,
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
                      padding: '6px 10px',
                      borderRadius: '10px',
                      background: hasEnough ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      opacity: hasEnough ? 1 : 0.45,
                      cursor: hasEnough ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{bait.icon}</span>
                      <div>
                        <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#f8fafc' }}>
                          {bait.name}
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#94a3b8' }}>
                          В наличии: {count} шт.
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={!hasEnough}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: hasEnough
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        color: hasEnough ? '#fff' : '#64748b',
                        fontSize: '10px',
                        fontWeight: 800,
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
              borderRadius: '8px',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              background: 'rgba(15, 23, 42, 0.5)',
              padding: '4px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px' }}>🔒</div>
            <div style={{ fontSize: '8.5px', fontWeight: 800, color: '#cbd5e1' }}>
              Крючок #2
            </div>
            <button
              disabled={!canAfford}
              onClick={() => onUnlockHook(selectedSlotIndex, 2)}
              style={{
                padding: '2px 5px',
                borderRadius: '6px',
                background: canAfford
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                color: canAfford ? '#fff' : '#64748b',
                fontSize: '8px',
                fontWeight: 900,
                cursor: canAfford ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              5 000 <CoinIcon size={9} />
            </button>
            <span style={{ fontSize: '7px', color: '#64748b' }}>с 5 ур.</span>
          </div>
        );
      } else if (hookNumber === 3) {
        const canAfford = gems >= 75;
        return (
          <div
            key={hookIdx}
            style={{
              borderRadius: '8px',
              border: '1px dashed rgba(234, 179, 8, 0.3)',
              background: 'rgba(15, 23, 42, 0.5)',
              padding: '4px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px' }}>💎</div>
            <div style={{ fontSize: '8.5px', fontWeight: 800, color: '#fbbf24' }}>
              Крючок #3
            </div>
            <button
              disabled={!canAfford}
              onClick={() => onUnlockHook(selectedSlotIndex, 3)}
              style={{
                padding: '2px 5px',
                borderRadius: '6px',
                background: canAfford
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                color: '#fff',
                fontSize: '8px',
                fontWeight: 900,
                cursor: canAfford ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              75 <GemIcon size={9} />
            </button>
            <span style={{ fontSize: '7px', color: '#fbbf24' }}>Сразу</span>
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
          borderRadius: '8px',
          border: baitInfo
            ? '1.5px solid rgba(16, 185, 129, 0.5)'
            : '1px dashed rgba(255, 255, 255, 0.2)',
          background: baitInfo
            ? 'rgba(16, 185, 129, 0.12)'
            : 'rgba(15, 23, 42, 0.5)',
          padding: '4px 4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          cursor: isCast ? 'default' : 'pointer',
          transition: 'all 0.12s ease',
        }}
      >
        <span style={{ fontSize: '8px', color: '#cbd5e1', fontWeight: 800 }}>
          Крючок #{hookNumber}
        </span>

        {baitInfo ? (
          <>
            <span style={{ fontSize: 'clamp(14px, 3.2vw, 18px)' }}>{baitInfo.icon}</span>
            <span
              style={{
                fontSize: 'clamp(8px, 1.9vw, 9.5px)',
                fontWeight: 900,
                color: '#f8fafc',
                maxWidth: '65px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {baitInfo.name}
            </span>
            {!isCast && (
              <span style={{ fontSize: '7.5px', color: '#38bdf8', fontWeight: 700 }}>Сменить</span>
            )}
          </>
        ) : (
          <>
            <span style={{ fontSize: 'clamp(12px, 2.8vw, 16px)', opacity: 0.55 }}>🪝</span>
            <span style={{ fontSize: '7.5px', color: '#94a3b8' }}>Пусто</span>
            {!isCast && (
              <span style={{ fontSize: '7.5px', color: '#10b981', fontWeight: 800 }}>
                + Насадить
              </span>
            )}
          </>
        )}
      </div>
    );
  }
};
