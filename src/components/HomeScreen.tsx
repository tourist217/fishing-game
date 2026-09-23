import type { FishingLocation } from '../locationsData';
import {
  ROD_TIERS,
  REEL_TIERS,
  LINE_TIERS,
  getRodStrength,
  getReelPullSpeed,
  type PlayerGearState,
} from '../gearData';

interface HomeScreenProps {
  currentLocation: FishingLocation;
  gear: PlayerGearState;
  inventoryCount: number;
  onGoFishing: () => void;
  onOpenMap: () => void;
  onNavigateTab: (tab: 'inventory' | 'shop') => void;
}

export const HomeScreen = ({
  currentLocation,
  gear,
  inventoryCount,
  onGoFishing,
  onOpenMap,
  onNavigateTab,
}: HomeScreenProps) => {
  const currentRod = ROD_TIERS.find((r) => r.id === gear.equippedRodId) || ROD_TIERS[0];
  const rodLevel = gear.rodLevels[gear.equippedRodId] || 1;
  const rodStrength = getRodStrength(currentRod, rodLevel);

  const currentReel = gear.equippedReelId ? REEL_TIERS.find((r) => r.id === gear.equippedReelId) : null;
  const reelLevel = currentReel ? gear.reelLevels[currentReel.id] || 1 : 1;
  const reelSpeed = currentReel ? getReelPullSpeed(currentReel, reelLevel) : 1.0;

  const currentLine = LINE_TIERS.find((l) => l.id === gear.equippedLineId) || LINE_TIERS[0];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: '14px 0',
        gap: '12px',
      }}
    >
      {/* Карточка текущей локации */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '20px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Текущее место
          </div>
          <button
            onClick={onOpenMap}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Сменить 🗺️
          </button>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ fontSize: '44px' }}>{currentLocation.icon}</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: currentLocation.accentColor }}>
              {currentLocation.name}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Множитель веса: <strong>x{currentLocation.weightModifier}</strong>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4', margin: 0 }}>
          {currentLocation.description}
        </p>

        <button
          onClick={onGoFishing}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Отправиться на рыбалку</span>
          <span style={{ fontSize: '18px' }}>🎣</span>
        </button>
      </div>

      {/* Быстрое меню базы */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div
          onClick={() => onNavigateTab('shop')}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontSize: '26px' }}>🛒</div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Рыболовный цех</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Снасти, наживки, бафы</div>
        </div>

        <div
          onClick={() => onNavigateTab('inventory')}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '26px' }}>🐟</span>
            {inventoryCount > 0 && (
              <span style={{ background: '#2563eb', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                {inventoryCount} шт.
              </span>
            )}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Садок с уловом</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Продажа рыбы на рынке</div>
        </div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '16px',
            padding: '14px',
            border: '1px dashed rgba(255, 255, 255, 0.08)',
            opacity: 0.6,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontSize: '26px' }}>🏆</div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Турниры</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Скоро: онлайн кубки</div>
        </div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '16px',
            padding: '14px',
            border: '1px dashed rgba(255, 255, 255, 0.08)',
            opacity: 0.6,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontSize: '26px' }}>⚙️</div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Настройки</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Звуки, профиль</div>
        </div>
      </div>

      {/* Панель текущей сборки снастей */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '14px',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '11px',
          color: '#94a3b8',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Бланк: <strong style={{ color: '#fff' }}>{currentRod.icon} {currentRod.name} [{rodLevel} ур.]</strong></span>
          <span style={{ color: '#4ade80' }}>до {rodStrength} кг</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Катушка: <strong style={{ color: '#fff' }}>{currentReel ? `${currentReel.icon} ${currentReel.name}` : 'Глухая снасть'}</strong></span>
          <span style={{ color: '#38bdf8' }}>{currentReel ? `x${reelSpeed} смотка` : 'x1.0'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Леска: <strong style={{ color: '#fff' }}>{currentLine.icon} {currentLine.name}</strong></span>
          <span style={{ color: '#fbbf24' }}>разрыв: {currentLine.maxTensileKg} кг</span>
        </div>
      </div>
    </div>
  );
};