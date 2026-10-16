import { useState } from 'react';
import { ROD_TIERS, REEL_TIERS, LINE_TIERS, type PlayerGearState } from '../gearData';
import { AVAILABLE_BAITS } from '../hooks/useBaitState';
import { RodIcon, BaitIcon } from './HomeScreen';

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
        gap: '10px',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* 1. Блок текущего экипированного комплекта снастей */}
      <div
        style={{
          background: 'rgba(22, 28, 38, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '10px 12px',
          borderRadius: '22px',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px',
          }}
        >
          🎣 Экипированный комплект
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {/* Удочка */}
          <div
            onClick={() => setActiveCategory('rods')}
            style={{
              background: activeCategory === 'rods' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.75)',
              border: activeCategory === 'rods' ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <RodIcon material={currentRod.material} />
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#fff', marginTop: '3px', textAlign: 'center', lineHeight: 1.1 }}>
              {currentRod.name.split(' ')[0]}
            </div>
            <div style={{ fontSize: '8px', color: '#38bdf8', fontWeight: 700 }}>
              {gear.rodLevels[currentRod.id] || 1} ур.
            </div>
          </div>

          {/* Катушка */}
          <div
            onClick={() => setActiveCategory('reels')}
            style={{
              background: activeCategory === 'reels' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.75)',
              border: activeCategory === 'reels' ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '24px' }}>{currentReel?.icon || '⚙️'}</span>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#fff', marginTop: '3px', textAlign: 'center', lineHeight: 1.1 }}>
              {currentReel ? currentReel.name.split(' ')[0] : 'Без кат.'}
            </div>
            <div style={{ fontSize: '8px', color: currentReel ? '#4ade80' : '#64748b', fontWeight: 700 }}>
              {currentReel ? `${gear.reelLevels[currentReel.id] || 1} ур.` : '—'}
            </div>
          </div>

          {/* Леска */}
          <div
            onClick={() => setActiveCategory('lines')}
            style={{
              background: activeCategory === 'lines' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.75)',
              border: activeCategory === 'lines' ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '24px' }}>{currentLine.icon || '🧵'}</span>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#fff', marginTop: '3px', textAlign: 'center', lineHeight: 1.1 }}>
              Леска
            </div>
            <div style={{ fontSize: '8px', color: '#fbbf24', fontWeight: 700 }}>
              до {currentLine.maxTensileKg} кг
            </div>
          </div>

          {/* Наживка */}
          <div
            onClick={() => setActiveCategory('baits')}
            style={{
              background: activeCategory === 'baits' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.75)',
              border: activeCategory === 'baits' ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <BaitIcon baitId={currentBait.id} />
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#fff', marginTop: '3px', textAlign: 'center', lineHeight: 1.1 }}>
              {currentBait.name}
            </div>
            <div style={{ fontSize: '8px', color: '#4ade80', fontWeight: 700 }}>
              {baits[currentBait.id] || 0} шт.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Переключатель категорий рюкзака */}
      <div style={{ display: 'flex', gap: '6px' }}>
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
              onClick={() => setActiveCategory(cat.id as any)}
              style={{
                flex: 1,
                background: isActive ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(22, 28, 38, 0.8)',
                border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '8px 4px',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: 800,
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

      {/* 3. Список предметов в выбранной категории */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '2px',
        }}
      >
        {/* Удилища */}
        {activeCategory === 'rods' && (
          <>
            {ROD_TIERS.filter((r) => gear.ownedRods.includes(r.id)).map((rod) => {
              const isEquipped = gear.equippedRodId === rod.id;
              const rLevel = gear.rodLevels[rod.id] || 1;
              return (
                <div
                  key={rod.id}
                  style={{
                    background: isEquipped ? 'rgba(56, 189, 248, 0.15)' : 'rgba(22, 28, 38, 0.85)',
                    border: isEquipped ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RodIcon material={rod.material} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                        {rod.name} [{rLevel} ур.]
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                        Прочность: {rod.baseStrengthKg} - {rod.maxStrengthKg} кг
                      </div>
                    </div>
                  </div>
                  {isEquipped ? (
                    <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800 }}>
                      ✓ На леске
                    </span>
                  ) : (
                    <button
                      onClick={() => onEquipRod(rod.id)}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '6px 12px',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Взять
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Катушки */}
        {activeCategory === 'reels' && (
          <>
            {REEL_TIERS.filter((r) => gear.ownedReels.includes(r.id)).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '12px' }}>
                В рюкзаке пока нет купленных катушек.<br />Их можно приобрести в магазине!
              </div>
            ) : (
              REEL_TIERS.filter((r) => gear.ownedReels.includes(r.id)).map((reel) => {
                const isEquipped = gear.equippedReelId === reel.id;
                const rLevel = gear.reelLevels[reel.id] || 1;
                return (
                  <div
                    key={reel.id}
                    style={{
                      background: isEquipped ? 'rgba(56, 189, 248, 0.15)' : 'rgba(22, 28, 38, 0.85)',
                      border: isEquipped ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '26px' }}>{reel.icon}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                          {reel.name} [{rLevel} ур.]
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                          Скорость: x{reel.basePullSpeed} - x{reel.maxPullSpeed} | Размер: {reel.size}
                        </div>
                      </div>
                    </div>
                    {isEquipped ? (
                      <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800 }}>
                        ✓ На удилище
                      </span>
                    ) : (
                      <button
                        onClick={() => onEquipReel(reel.id)}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '6px 12px',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
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
        {activeCategory === 'lines' && (
          <>
            {LINE_TIERS.filter((l) => (gear.lineStock[l.id] || 0) > 0 || gear.equippedLineId === l.id).map((line) => {
              const isEquipped = gear.equippedLineId === line.id;
              const stock = gear.lineStock[line.id] || 0;
              return (
                <div
                  key={line.id}
                  style={{
                    background: isEquipped ? 'rgba(56, 189, 248, 0.15)' : 'rgba(22, 28, 38, 0.85)',
                    border: isEquipped ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '26px' }}>{line.icon}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                        {line.name}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                        Макс. нагрузка: {line.maxTensileKg} кг | В запасе: {stock} шт.
                      </div>
                    </div>
                  </div>
                  {isEquipped ? (
                    <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800 }}>
                      ✓ Намотана
                    </span>
                  ) : (
                    <button
                      onClick={() => onEquipLine(line.id)}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '6px 12px',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Намотать
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Наживки */}
        {activeCategory === 'baits' && (
          <>
            {AVAILABLE_BAITS.map((bait) => {
              const isSelected = selectedBaitId === bait.id;
              const count = baits[bait.id] || 0;
              return (
                <div
                  key={bait.id}
                  style={{
                    background: isSelected ? 'rgba(74, 222, 128, 0.15)' : 'rgba(22, 28, 38, 0.85)',
                    border: isSelected ? '1.5px solid #4ade80' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BaitIcon baitId={bait.id} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                        {bait.name}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                        В банке: <strong>{count} шт.</strong> | {bait.description}
                      </div>
                    </div>
                  </div>
                  {isSelected ? (
                    <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 800 }}>
                      ✓ На крючке
                    </span>
                  ) : count > 0 ? (
                    <button
                      onClick={() => onSelectBait(bait.id)}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '6px 12px',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Насадить
                    </button>
                  ) : (
                    <button
                      onClick={onOpenShop}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        padding: '6px 10px',
                        color: '#fbbf24',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Купить
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* 4. Кнопка перехода в магазин */}
      <button
        onClick={onOpenShop}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
          border: 'none',
          borderRadius: '16px',
          padding: '11px',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4)',
        }}
      >
        <span>🏪</span>
        <span>Купить новые снасти в магазине</span>
      </button>
    </div>
  );
};
