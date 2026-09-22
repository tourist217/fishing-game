import type { FishingLocation } from '../locationsData';
import type { Rod } from '../shopData';

interface HomeScreenProps {
  currentLocation: FishingLocation;
  currentRod: Rod;
  inventoryCount: number;
  onGoFishing: () => void;
  onOpenMap: () => void;
  onNavigateTab: (tab: 'inventory' | 'shop') => void;
}

export const HomeScreen = ({
  currentLocation,
  currentRod,
  inventoryCount,
  onGoFishing,
  onOpenMap,
  onNavigateTab,
}: HomeScreenProps) => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: '14px 0',
        gap: '14px',
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

        {/* Главная кнопка входа на локацию */}
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
        {/* Кнопка магазина */}
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

        {/* Кнопка садка */}
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

        {/* Заглушка под турниры */}
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

        {/* Заглушка под настройки / статистику */}
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

      {/* Инфо текущего снаряжения */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#94a3b8',
        }}
      >
        <span>В руках: <strong style={{ color: '#fff' }}>{currentRod.icon} {currentRod.name}</strong></span>
        <span>Зона: <strong style={{ color: '#4ade80' }}>+{currentRod.sweetSpotBonus}%</strong></span>
      </div>
    </div>
  );
};