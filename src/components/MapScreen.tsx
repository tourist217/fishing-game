import { LOCATIONS, type FishingLocation } from '../locationsData';
import { FISH_DATABASE } from '../fishData';

interface MapScreenProps {
  playerLevel: number;
  currentLocationId: string;
  onSelectLocation: (loc: FishingLocation) => void;
  onGoFishing: () => void;
}

export const MapScreen = ({
  playerLevel,
  currentLocationId,
  onSelectLocation,
  onGoFishing,
}: MapScreenProps) => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        margin: '16px 0',
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Карта водоёмов 🗺️</h2>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
          Выберите место для ловли. Чем глубже водоём, тем крупнее рыба!
        </p>
      </div>

      {/* Список водоёмов */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingRight: '4px',
        }}
      >
        {LOCATIONS.map((loc) => {
          const isUnlocked = playerLevel >= loc.levelReq;
          const isCurrent = currentLocationId === loc.id;
          const locationFish = FISH_DATABASE.filter((f) => Boolean(f.habitats[loc.id]));

          return (
            <div
              key={loc.id}
              onClick={() => {
                if (isUnlocked) onSelectLocation(loc);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: isCurrent ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                borderRadius: '18px',
                padding: '14px',
                border: isCurrent
                  ? '2px solid #3b82f6'
                  : isUnlocked
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px dashed rgba(255, 255, 255, 0.05)',
                opacity: isUnlocked ? 1 : 0.6,
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ fontSize: '38px' }}>{loc.icon}</div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: loc.accentColor }}>
                      {loc.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {isUnlocked ? `Доступно (с ур. ${loc.levelReq})` : `Требуется уровень: ${loc.levelReq} 🔒`}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      background: 'rgba(251, 191, 36, 0.15)',
                      color: '#fcd34d',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}
                  >
                    Вес рыбы: x{loc.weightModifier}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
                {loc.description}
              </p>

              {/* Обитающие виды рыб */}
              <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                  Обитающие рыбы:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {locationFish.map((fish) => (
                    <span
                      key={fish.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#e2e8f0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>{fish.icon}</span>
                      <span>{fish.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              {isUnlocked && isCurrent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGoFishing();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                  }}
                >
                  Отправиться на рыбалку 🎣
                </button>
              )}

              {isUnlocked && !isCurrent && (
                <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '4px' }}>
                  Нажмите, чтобы выбрать этот водоём
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};