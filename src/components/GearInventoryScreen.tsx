import { useState } from 'react';
import { ROD_TIERS, REEL_TIERS, LINE_TIERS, type PlayerGearState } from '../gearData';
import { AVAILABLE_BAITS } from '../hooks/useBaitState';
import { RodIcon, BaitIcon } from './HomeScreen';
import { BoardHeader } from './BoardHeader';
import { triggerHaptic } from '../utils/haptics';

interface GearInventoryScreenProps {
  gear: PlayerGearState;
  baits: Record<string, number>;
  selectedBaitId: string;
  onEquipRod: (rodId: string) => void;
  onEquipReel: (reelId: string) => void;
  onEquipLine: (lineId: string) => void;
  onSelectBait: (baitId: string) => void;
  onOpenShop: () => void;
}

export const GearInventoryScreen = ({
  gear,
  baits,
  selectedBaitId,
  onEquipRod,
  onEquipReel,
  onEquipLine,
  onSelectBait,
  onOpenShop,
}: GearInventoryScreenProps) => {
  const [activeCategory, setActiveCategory] = useState<'rods' | 'reels' | 'lines' | 'baits'>('rods');

  const currentRod = ROD_TIERS.find((r) => r.id === gear.equippedRodId) || ROD_TIERS[0];
  const currentReel = REEL_TIERS.find((r) => r.id === gear.equippedReelId);
  const currentLine = LINE_TIERS.find((l) => l.id === gear.equippedLineId) || LINE_TIERS[0];
  const currentBait = AVAILABLE_BAITS.find((b) => b.id === selectedBaitId) || AVAILABLE_BAITS[0];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: 'max(4px, env(safe-area-inset-top, 4px)) 4px 6px 4px',
        width: '100%',
        userSelect: 'none',
      }}
    >
      {/* 1. СЛОЙ ФОНА: Универсальная деревянная доска */}
      <div
        style={{
          position: 'relative',
          width: 'min(calc((100dvh - 84px) * 0.727), 100vw - 12px, 430px)',
          aspectRatio: '745 / 1024',
          maxHeight: 'calc(100dvh - 84px)',
          backgroundImage: "url('/assets/ui/universal_board.png')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'drop-shadow(0 14px 36px rgba(0, 0, 0, 0.85))',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* 2. СЛОЙ ЗАГОЛОВКА: Единый 3D золотой заголовок поверх верхней деревянной планки */}
        <BoardHeader
          title="Инвентарь"
          subtitle="Снаряжение рыбака и запасы снастей"
        />

        {/* 3. СЛОЙ КОНТЕНТА: Рабочая область внутри деревянной рамы */}
        <div
          style={{
            position: 'absolute',
            left: '7.5%',
            right: '7.5%',
            top: '12.8%',
            bottom: '6.2%',
            display: 'flex',
            flexDirection: 'column',
            gap: '7px',
            padding: '2px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {/* Блок текущего экипированного комплекта снастей */}
          <div
            style={{
              background: 'rgba(25, 14, 7, 0.85)',
              border: '1px solid rgba(251, 191, 36, 0.28)',
              borderRadius: '14px',
              padding: '7px 8px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#fef3c7',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                marginBottom: '5px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>🎣 Комплект на удилище</span>
              <span style={{ color: '#fbbf24' }}>Нажмите для смены</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
              {/* Удочка */}
              <div
                onClick={() => {
                  setActiveCategory('rods');
                  triggerHaptic('selection');
                }}
                style={{
                  background: activeCategory === 'rods' ? 'rgba(251, 191, 36, 0.25)' : 'rgba(15, 8, 4, 0.65)',
                  border: activeCategory === 'rods' ? '1.5px solid #facc15' : '1px solid rgba(251, 191, 36, 0.2)',
                  borderRadius: '11px',
                  padding: '5px 3px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <RodIcon material={currentRod.material} />
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#fff', marginTop: '2px', textAlign: 'center', lineHeight: 1.1 }}>
                  {currentRod.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: '8px', color: '#fde047', fontWeight: 700 }}>
                  {gear.rodLevels[currentRod.id] || 1} ур.
                </div>
              </div>

              {/* Катушка */}
              <div
                onClick={() => {
                  setActiveCategory('reels');
                  triggerHaptic('selection');
                }}
                style={{
                  background: activeCategory === 'reels' ? 'rgba(251, 191, 36, 0.25)' : 'rgba(15, 8, 4, 0.65)',
                  border: activeCategory === 'reels' ? '1.5px solid #facc15' : '1px solid rgba(251, 191, 36, 0.2)',
                  borderRadius: '11px',
                  padding: '5px 3px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '20px' }}>{currentReel?.icon || '⚙️'}</span>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#fff', marginTop: '2px', textAlign: 'center', lineHeight: 1.1 }}>
                  {currentReel ? currentReel.name.split(' ')[0] : 'Без кат.'}
                </div>
                <div style={{ fontSize: '8px', color: currentReel ? '#4ade80' : '#94a3b8', fontWeight: 700 }}>
                  {currentReel ? `${gear.reelLevels[currentReel.id] || 1} ур.` : '—'}
                </div>
              </div>

              {/* Леска */}
              <div
                onClick={() => {
                  setActiveCategory('lines');
                  triggerHaptic('selection');
                }}
                style={{
                  background: activeCategory === 'lines' ? 'rgba(251, 191, 36, 0.25)' : 'rgba(15, 8, 4, 0.65)',
                  border: activeCategory === 'lines' ? '1.5px solid #facc15' : '1px solid rgba(251, 191, 36, 0.2)',
                  borderRadius: '11px',
                  padding: '5px 3px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '20px' }}>{currentLine.icon || '🧵'}</span>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#fff', marginTop: '2px', textAlign: 'center', lineHeight: 1.1 }}>
                  Леска
                </div>
                <div style={{ fontSize: '8px', color: '#38bdf8', fontWeight: 700 }}>
                  до {currentLine.maxTensileKg} кг
                </div>
              </div>

              {/* Наживка */}
              <div
                onClick={() => {
                  setActiveCategory('baits');
                  triggerHaptic('selection');
                }}
                style={{
                  background: activeCategory === 'baits' ? 'rgba(251, 191, 36, 0.25)' : 'rgba(15, 8, 4, 0.65)',
                  border: activeCategory === 'baits' ? '1.5px solid #facc15' : '1px solid rgba(251, 191, 36, 0.2)',
                  borderRadius: '11px',
                  padding: '5px 3px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <BaitIcon baitId={currentBait.id} />
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#fff', marginTop: '2px', textAlign: 'center', lineHeight: 1.1 }}>
                  {currentBait.name}
                </div>
                <div style={{ fontSize: '8px', color: '#4ade80', fontWeight: 700 }}>
                  {baits[currentBait.id] || 0} шт.
                </div>
              </div>
            </div>
          </div>

          {/* Переключатель категорий рюкзака */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(20, 12, 6, 0.8)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              borderRadius: '12px',
              padding: '3px',
              gap: '4px',
            }}
          >
            {[
              { id: 'rods', label: 'Удилища', icon: '🎣' },
              { id: 'reels', label: 'Катушки', icon: '⚙️' },
              { id: 'lines', label: 'Лески', icon: '🧵' },
              { id: 'baits', label: 'Наживки', icon: '🪱' },
            ].map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id as any);
                    triggerHaptic('selection');
                  }}
                  style={{
                    flex: 1,
                    background: isActive ? 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)' : 'transparent',
                    border: 'none',
                    borderRadius: '9px',
                    padding: '6px 3px',
                    color: isActive ? '#1c1917' : '#fef3c7',
                    fontWeight: 900,
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Список предметов в выбранной категории */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              paddingRight: '2px',
            }}
          >
            {/* Удилища */}
            {activeCategory === 'rods' &&
              ROD_TIERS.filter((r) => gear.ownedRods.includes(r.id)).map((rod) => {
                const isEquipped = gear.equippedRodId === rod.id;
                const rLevel = gear.rodLevels[rod.id] || 1;
                return (
                  <div
                    key={rod.id}
                    style={{
                      background: isEquipped ? 'rgba(35, 22, 10, 0.9)' : 'rgba(25, 14, 7, 0.82)',
                      border: isEquipped ? '1.5px solid #facc15' : '1px solid rgba(251, 191, 36, 0.22)',
                      borderRadius: '13px',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isEquipped ? '0 0 10px rgba(250, 204, 21, 0.3)' : '0 2px 5px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RodIcon material={rod.material} />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#fef3c7' }}>
                          {rod.name} [{rLevel} ур.]
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#cbd5e1' }}>
                          Прочность: {rod.baseStrengthKg} - {rod.maxStrengthKg} кг
                        </div>
                      </div>
                    </div>
                    {isEquipped ? (
                      <span style={{ fontSize: '11px', color: '#facc15', fontWeight: 800 }}>
                        ✓ На леске
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onEquipRod(rod.id);
                          triggerHaptic('impact');
                        }}
                        style={{
                          background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
                          border: '1px solid #86efac',
                          borderRadius: '9px',
                          padding: '5px 12px',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 900,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        Взять
                      </button>
                    )}
                  </div>
                );
              })}

            {/* Катушки */}
            {activeCategory === 'reels' && (
              <>
                {REEL_TIERS.filter((r) => gear.ownedReels.includes(r.id)).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 10px', color: '#fed7aa', fontSize: '11.5px' }}>
                    В запасе пока нет купленных катушек.<br />Их можно приобрести в магазине!
                  </div>
                ) : (
                  REEL_TIERS.filter((r) => gear.ownedReels.includes(r.id)).map((reel) => {
                    const isEquipped = gear.equippedReelId === reel.id;
                    const rLevel = gear.reelLevels[reel.id] || 1;
                    return (
                      <div
                        key={reel.id}
                        style={{
                          background: isEquipped ? 'rgba(35, 22, 10, 0.9)' : 'rgba(25, 14, 7, 0.82)',
                          border: isEquipped ? '1.5px solid #facc15' : '1px solid rgba(251, 191, 36, 0.22)',
                          borderRadius: '13px',
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: isEquipped ? '0 0 10px rgba(250, 204, 21, 0.3)' : '0 2px 5px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '24px' }}>{reel.icon}</span>
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#fef3c7' }}>
                              {reel.name} [{rLevel} ур.]
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#cbd5e1' }}>
                              Скорость: x{reel.basePullSpeed} - x{reel.maxPullSpeed} | Разм: {reel.size}
                            </div>
                          </div>
                        </div>
                        {isEquipped ? (
                          <span style={{ fontSize: '11px', color: '#facc15', fontWeight: 800 }}>
                            ✓ На удилище
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              onEquipReel(reel.id);
                              triggerHaptic('impact');
                            }}
                            style={{
                              background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
                              border: '1px solid #86efac',
                              borderRadius: '9px',
                              padding: '5px 12px',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: 900,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                            }}
                          >
                            Установить
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* Лески */}
            {activeCategory === 'lines' &&
              LINE_TIERS.filter((l) => (gear.lineStock[l.id] || 0) > 0 || gear.equippedLineId === l.id).map((line) => {
                const isEquipped = gear.equippedLineId === line.id;
                const stock = gear.lineStock[line.id] || 0;
                return (
                  <div
                    key={line.id}
                    style={{
                      background: isEquipped ? 'rgba(35, 22, 10, 0.9)' : 'rgba(25, 14, 7, 0.82)',
                      border: isEquipped ? '1.5px solid #facc15' : '1px solid rgba(251, 191, 36, 0.22)',
                      borderRadius: '13px',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isEquipped ? '0 0 10px rgba(250, 204, 21, 0.3)' : '0 2px 5px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{line.icon}</span>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#fef3c7' }}>
                          {line.name}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#cbd5e1' }}>
                          Нагрузка: {line.maxTensileKg} кг | Запас: {stock} шт.
                        </div>
                      </div>
                    </div>
                    {isEquipped ? (
                      <span style={{ fontSize: '11px', color: '#facc15', fontWeight: 800 }}>
                        ✓ Намотана
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onEquipLine(line.id);
                          triggerHaptic('impact');
                        }}
                        style={{
                          background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
                          border: '1px solid #86efac',
                          borderRadius: '9px',
                          padding: '5px 12px',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 900,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        Намотать
                      </button>
                    )}
                  </div>
                );
              })}

            {/* Наживки */}
            {activeCategory === 'baits' &&
              AVAILABLE_BAITS.map((bait) => {
                const isSelected = selectedBaitId === bait.id;
                const count = baits[bait.id] || 0;
                return (
                  <div
                    key={bait.id}
                    style={{
                      background: isSelected ? 'rgba(35, 22, 10, 0.9)' : 'rgba(25, 14, 7, 0.82)',
                      border: isSelected ? '1.5px solid #4ade80' : '1px solid rgba(251, 191, 36, 0.22)',
                      borderRadius: '13px',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? '0 0 10px rgba(74, 222, 128, 0.3)' : '0 2px 5px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BaitIcon baitId={bait.id} />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#fef3c7' }}>
                          {bait.name}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#cbd5e1' }}>
                          В банке: <strong style={{ color: count > 0 ? '#4ade80' : '#f87171' }}>{count} шт.</strong>
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 800 }}>
                        ✓ На крючке
                      </span>
                    ) : count > 0 ? (
                      <button
                        onClick={() => {
                          onSelectBait(bait.id);
                          triggerHaptic('selection');
                        }}
                        style={{
                          background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
                          border: '1px solid #86efac',
                          borderRadius: '9px',
                          padding: '5px 12px',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 900,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        Насадить
                      </button>
                    ) : (
                      <button
                        onClick={onOpenShop}
                        style={{
                          background: 'rgba(20, 10, 5, 0.7)',
                          border: '1px solid rgba(251, 191, 36, 0.4)',
                          borderRadius: '9px',
                          padding: '5px 10px',
                          color: '#fbbf24',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        Купить
                      </button>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Кнопка перехода в магазин */}
          <button
            onClick={() => {
              triggerHaptic('selection');
              onOpenShop();
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
              border: '1.5px solid #fef08a',
              borderRadius: '12px',
              padding: '8px 10px',
              color: '#1c1917',
              fontWeight: 900,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(250, 204, 21, 0.45)',
              flexShrink: 0,
            }}
          >
            <span>🏪</span>
            <span>Купить новые снасти в магазине</span>
          </button>
        </div>
      </div>
    </div>
  );
};
