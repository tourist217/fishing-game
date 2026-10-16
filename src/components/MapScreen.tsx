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
        gap: '10px',
        paddingBottom: '2px',
      }}
    >
      {/* Шапка карты водоёмов */}
      <div
        style={{
          background: 'rgba(22, 28, 38, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '12px 14px',
          borderRadius: '22px',
          border: '1.5px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '13px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
          }}
        >
          🗺️
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
            Карта водоёмов
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
            Выберите место для ловли трофейной рыбы
          </div>
        </div>
      </div>

      {/* Список водоёмов */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          paddingRight: '2px',
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
                background: isCurrent ? 'rgba(30, 41, 59, 0.92)' : 'rgba(22, 28, 38, 0.82)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderRadius: '22px',
                padding: '14px',
                border: isCurrent
                  ? '2px solid #38bdf8'
                  : isUnlocked
                  ? '1px solid rgba(255, 255, 255, 0.12)'
                  : '1px dashed rgba(255, 255, 255, 0.08)',
                opacity: isUnlocked ? 1 : 0.65,
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                boxShadow: isCurrent
                  ? '0 0 24px rgba(56, 189, 248, 0.3), 0 8px 24px rgba(0,0,0,0.45)'
                  : '0 6px 20px rgba(0, 0, 0, 0.35)',
                transition: 'all 0.18s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                    }}
                  >
                    {loc.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#ffffff' }}>
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
                      color: '#fbbf24',
                      border: '1px solid rgba(251, 191, 36, 0.35)',
                      padding: '4px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    Вес: x{loc.weightModifier}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.45', margin: 0 }}>
                {loc.description}
              </p>

              {/* Обитающие виды рыб */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700 }}>
                  Обитающие рыбы:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {locationFish.map((fish) => (
                    <span
                      key={fish.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '8px',
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
                    borderRadius: '16px',
                    border: '2px solid #bef264',
                    background: 'linear-gradient(180deg, #84cc16 0%, #65a30d 50%, #4d7c0f 100%)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(132, 204, 22, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)',
                    marginTop: '2px',
                  }}
                >
                  Отправиться на рыбалку 🎣
                </button>
              )}

              {isUnlocked && !isCurrent && (
                <div style={{ fontSize: '11.5px', color: '#94a3b8', textAlign: 'center', padding: '4px' }}>
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