import React, { useState, useRef, useEffect } from 'react';
import { LOCATIONS, type FishingLocation } from '../locationsData';
import { FISH_DATABASE } from '../fishData';

interface MapScreenProps {
  playerLevel: number;
  currentLocationId: string;
  onSelectLocation: (loc: FishingLocation) => void;
  onGoFishing: () => void;
}

// Погода и атмосфера на каждом водоёме
const LOCATION_WEATHER: Record<string, { label: string; icon: string; temp: string }> = {
  loc_village_pond: { label: 'Ясно, штиль', icon: '☀️', temp: '+22°C' },
  loc_old_oxbow: { label: 'Утренняя дымка', icon: '🌫️', temp: '+19°C' },
  loc_forest_lake: { label: 'Солнечно, сосны', icon: '🌲', temp: '+20°C' },
  loc_quiet_river: { label: 'Лёгкий ветерок', icon: '🌤️', temp: '+21°C' },
  loc_beaver_backwater: { label: 'Тёплый дождик', icon: '🌦️', temp: '+18°C' },
  loc_wide_reach: { label: 'Свежий бриз', icon: '💨', temp: '+19°C' },
  loc_reservoir: { label: 'Солнце и рябь', icon: '🌊', temp: '+23°C' },
  loc_oka_river: { label: 'Ясно, быстроток', icon: '☀️', temp: '+21°C' },
  loc_lower_volga: { label: 'Жарко, штиль', icon: '☀️', temp: '+27°C' },
  loc_ladoga_lake: { label: 'Прохладно, туман', icon: '☁️', temp: '+14°C' },
  loc_akhtuba_pits: { label: 'Сумерки, омуты', icon: '🌅', temp: '+24°C' },
  loc_caspian_delta: { label: 'Золотой закат', icon: '👑', temp: '+26°C' },
};

// Точные координаты точек на 2-секционной карте (в естественных пропорциях 9:16 без растяжения)
// Секция 2 (Волга и Дельта): Y = 0 ... 680px
// Секция 1 (Пруды и реки): Y = 680 ... 1360px
const MAP_TOTAL_HEIGHT = 1360;
const SECTION_HEIGHT = 680;

const MAP_POINTS = [
  // Секция 1: Родные просторы (низ)
  { id: 'loc_village_pond', x: 52, y: 1250 },   // Деревянный пирс с лодкой у избы
  { id: 'loc_old_oxbow', x: 72, y: 1140 },      // Заводь у песчаной косы
  { id: 'loc_forest_lake', x: 35, y: 1040 },    // Речной изгиб у деревянного мостика
  { id: 'loc_quiet_river', x: 64, y: 940 },     // Солнечный луг с берёзками
  { id: 'loc_beaver_backwater', x: 38, y: 840 },// Вход в сосновый бор
  { id: 'loc_wide_reach', x: 50, y: 740 },      // Глубокое лесное озеро

  // Секция 2: Великая Волга и Дельта Каспия (верх)
  { id: 'loc_reservoir', x: 48, y: 580 },       // Гранитный залив водохранилища
  { id: 'loc_oka_river', x: 66, y: 480 },       // Быстроток у скалистого мыса
  { id: 'loc_lower_volga', x: 32, y: 380 },     // Широкое русло Волги с песчаными косами
  { id: 'loc_ladoga_lake', x: 65, y: 280 },     // Островная протока с ивами
  { id: 'loc_akhtuba_pits', x: 38, y: 180 },    // Глубокий омут (Ахтубинские ямы)
  { id: 'loc_caspian_delta', x: 52, y: 80 },    // Лотосовые поля Дельты Каспия на закате
];

export const MapScreen: React.FC<MapScreenProps> = ({
  playerLevel,
  currentLocationId,
  onSelectLocation,
  onGoFishing,
}) => {
  const [selectedLocId, setSelectedLocId] = useState<string>(currentLocationId);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const inspectedLocation =
    LOCATIONS.find((l) => l.id === selectedLocId) ||
    LOCATIONS.find((l) => l.id === currentLocationId) ||
    LOCATIONS[0];

  const isCurrentEquipped = inspectedLocation.id === currentLocationId;
  const isInspectedUnlocked = playerLevel >= inspectedLocation.levelReq;
  const inspectedFish = FISH_DATABASE.filter((f) => Boolean(f.habitats[inspectedLocation.id]));
  const weather = LOCATION_WEATHER[inspectedLocation.id] || {
    label: 'Ясно',
    icon: '☀️',
    temp: '+20°C',
  };

  // Автоскролл к текущей точке игрока при открытии карты
  useEffect(() => {
    if (scrollContainerRef.current) {
      const point = MAP_POINTS.find((p) => p.id === currentLocationId);
      if (point) {
        const targetScrollTop = Math.max(0, point.y - 260);
        scrollContainerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        });
      }
    }
  }, [currentLocationId]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        background: '#0a1622',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55)',
      }}
    >
      {/* Стили анимаций */}
      <style>{`
        @keyframes rippleRing {
          0% { transform: translate(-50%, -50%) scale(0.65); opacity: 0.95; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
        @keyframes pinBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3.5px); }
        }
      `}</style>

      {/* Верхняя компактная плашка-заголовок карты */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          right: 8,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '18px',
          padding: '8px 14px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🗺️</span>
          <span style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.3px' }}>
            Карта водоёмов
          </span>
        </div>

        {/* Справа надпись: сколько открыто из скольки */}
        <div
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.14)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '10px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span style={{ color: '#94a3b8' }}>Открыто:</span>
          <span style={{ color: '#ffffff', fontWeight: 900 }}>
            {LOCATIONS.filter((l) => playerLevel >= l.levelReq).length} из {LOCATIONS.length}
          </span>
        </div>
      </div>

      {/* 3D-КАРТА ВОДОЁМОВ (100% ЕСТЕСТВЕННЫЕ ПРОПОРЦИИ) */}
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          WebkitOverflowScrolling: 'touch',
        }}
      >
          {/* Контейнер полного мира карты */}
          <div
            style={{
              width: '100%',
              height: `${MAP_TOTAL_HEIGHT}px`,
              position: 'relative',
              background: '#091520',
            }}
          >
            {/* СЕКЦИЯ 2: ВЕЛИКАЯ ВОЛГА И ДЕЛЬТА КАСПИЯ (ВЕРХ, Y = 0..680px) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${SECTION_HEIGHT}px`,
                backgroundImage: "url('/assets/locations/map_section_volga.jpg')",
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* СЕКЦИЯ 1: РОДНЫЕ ПРОСТОРЫ (НИЗ, Y = 680..1360px) */}
            <div
              style={{
                position: 'absolute',
                top: `${SECTION_HEIGHT}px`,
                left: 0,
                width: '100%',
                height: `${SECTION_HEIGHT}px`,
                backgroundImage: "url('/assets/locations/map_section_village.jpg')",
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Мягкий градиентный переход на стыке двух секций */}
            <div
              style={{
                position: 'absolute',
                top: `${SECTION_HEIGHT - 30}px`,
                left: 0,
                right: 0,
                height: '60px',
                background:
                  'linear-gradient(180deg, rgba(10,22,34,0) 0%, rgba(10,22,34,0.3) 50%, rgba(10,22,34,0) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Единая золотая тропа рыбака, проходящая сквозь обе секции */}
            <svg
              width="100%"
              height={MAP_TOTAL_HEIGHT}
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
              viewBox={`0 0 360 ${MAP_TOTAL_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="goldPathGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#fde047" floodOpacity="0.85" />
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* Линии между точками (снизу вверх) */}
              {MAP_POINTS.map((pt, idx) => {
                if (idx === 0) return null;
                const prev = MAP_POINTS[idx - 1];
                const x1 = (prev.x / 100) * 360;
                const y1 = prev.y;
                const x2 = (pt.x / 100) * 360;
                const y2 = pt.y;

                const cx1 = x1;
                const cy1 = (y1 + y2) / 2;
                const cx2 = x2;
                const cy2 = (y1 + y2) / 2;

                return (
                  <path
                    key={`trail-${pt.id}`}
                    d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                    stroke="#fde047"
                    strokeWidth="3.8"
                    strokeDasharray="6 8"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#goldPathGlow)"
                  />
                );
              })}
            </svg>

            {/* Интерактивные точки водоёмов (Nodes) */}
            {MAP_POINTS.map((point) => {
              const loc = LOCATIONS.find((l) => l.id === point.id);
              if (!loc) return null;

              const isUnlocked = playerLevel >= loc.levelReq;
              const isCurrent = currentLocationId === loc.id;
              const isSelected = inspectedLocation.id === loc.id;

              return (
                <div
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocId(loc.id);
                    setShowPreviewModal(true);
                  }}
                  style={{
                    position: 'absolute',
                    top: `${point.y}px`,
                    left: `${point.x}%`,
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    zIndex: isSelected ? 25 : 15,
                    transition: 'transform 0.18s ease',
                  }}
                >
                  {/* Водные круги ряби под выбранной или текущей точкой */}
                  {(isSelected || isCurrent) && (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          border: isSelected ? '2.5px solid #fde047' : '2px solid #38bdf8',
                          animation: 'rippleRing 2s infinite ease-out',
                          pointerEvents: 'none',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          border: isSelected ? '1.8px solid #fde047' : '1.8px solid #38bdf8',
                          animation: 'rippleRing 2s infinite ease-out 1s',
                          pointerEvents: 'none',
                        }}
                      />
                    </>
                  )}

                  {/* 3D-кнопка пина водоёма */}
                  <div
                    style={{
                      width: isSelected ? '54px' : '46px',
                      height: isSelected ? '54px' : '46px',
                      borderRadius: '50%',
                      background: isUnlocked
                        ? isCurrent
                          ? 'linear-gradient(135deg, #4ade80 0%, #15803d 100%)'
                          : isSelected
                          ? 'linear-gradient(135deg, #fde047 0%, #d97706 100%)'
                          : 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)'
                        : 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
                      border: isSelected
                        ? '3px solid #ffffff'
                        : isCurrent
                        ? '2.5px solid #bbf7d0'
                        : isUnlocked
                        ? '2.2px solid #e0f2fe'
                        : '2px solid #94a3b8',
                      boxShadow: isSelected
                        ? '0 0 22px rgba(253, 224, 71, 0.95), 0 6px 16px rgba(0,0,0,0.6)'
                        : isCurrent
                        ? '0 0 18px rgba(74, 222, 128, 0.85), 0 5px 14px rgba(0,0,0,0.6)'
                        : '0 5px 12px rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isSelected ? '24px' : '20px',
                      position: 'relative',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      animation: isSelected ? 'pinBob 2s infinite ease-in-out' : 'none',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    {isUnlocked ? (
                      loc.icon
                    ) : (
                      <span style={{ fontSize: '17px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
                        🔒
                      </span>
                    )}

                    {/* Бейдж уровня */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-3px',
                        right: '-4px',
                        background: isUnlocked ? '#15803d' : '#1e293b',
                        border: '1.2px solid #ffffff',
                        color: '#ffffff',
                        fontSize: '9px',
                        fontWeight: 900,
                        padding: '1px 4px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.6)',
                      }}
                    >
                      {loc.levelReq}
                    </span>
                  </div>

                  {/* Плашка с названием водоёма */}
                  <div
                    style={{
                      marginTop: '4px',
                      background: isSelected
                        ? 'rgba(15, 23, 42, 0.95)'
                        : 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: isSelected
                        ? '1.8px solid #facc15'
                        : isCurrent
                        ? '1.8px solid #4ade80'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '2.5px 7px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.55)',
                      whiteSpace: 'nowrap',
                      maxWidth: '135px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        color: isSelected
                          ? '#fde047'
                          : isCurrent
                          ? '#4ade80'
                          : isUnlocked
                          ? '#ffffff'
                          : '#94a3b8',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {loc.name}
                    </span>
                    {isCurrent && (
                      <span style={{ fontSize: '9px', color: '#4ade80' }}>●</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* НИЖНЯЯ ВСПЛЫВАЮЩАЯ КАРТОЧКА ПРЕДПРОСМОТРА ВОДОЁМА (PREVIEW MODAL) */}
      {showPreviewModal && (
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            left: 8,
            right: 8,
            zIndex: 40,
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '22px',
            border: isInspectedUnlocked
              ? isCurrentEquipped
                ? '1.8px solid #4ade80'
                : '1.8px solid #38bdf8'
              : '1.8px solid rgba(239, 68, 68, 0.5)',
            padding: '12px 14px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Заголовок карточки: иконка, имя, погода, закрыть */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: inspectedLocation.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                }}
              >
                {inspectedLocation.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#ffffff' }}>
                    {inspectedLocation.name}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      background: isInspectedUnlocked ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: isInspectedUnlocked ? '#4ade80' : '#f87171',
                      border: isInspectedUnlocked
                        ? '1px solid rgba(34, 197, 94, 0.4)'
                        : '1px solid rgba(239, 68, 68, 0.4)',
                      padding: '1px 6px',
                      borderRadius: '8px',
                    }}
                  >
                    Ур. {inspectedLocation.levelReq}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'flex', gap: '6px' }}>
                  <span>{weather.icon} {weather.label} ({weather.temp})</span>
                  <span>•</span>
                  <span>Вес: x{inspectedLocation.weightModifier}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPreviewModal(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#cbd5e1',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* Описание водоёма */}
          <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.35' }}>
            {inspectedLocation.description}
          </div>

          {/* Обитающая рыба */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Рыба:
            </span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'nowrap' }}>
              {inspectedFish.slice(0, 5).map((fish) => (
                <span
                  key={fish.id}
                  style={{
                    background: 'rgba(30, 41, 59, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    color: '#e2e8f0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{fish.icon}</span>
                  <span>{fish.name}</span>
                </span>
              ))}
              {inspectedFish.length > 5 && (
                <span
                  style={{
                    background: 'rgba(30, 41, 59, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '2px 5px',
                    fontSize: '10px',
                    color: '#94a3b8',
                  }}
                >
                  +{inspectedFish.length - 5}
                </span>
              )}
            </div>
          </div>

          {/* Сочная кнопка действия */}
          {isInspectedUnlocked ? (
            <button
              onClick={() => {
                onSelectLocation(inspectedLocation);
                onGoFishing();
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '14px',
                border: '1.5px solid #86efac',
                background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 55%, #15803d 100%)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(34, 197, 94, 0.5)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              }}
            >
              <span>🎣</span>
              <span>
                {isCurrentEquipped ? 'Ловить рыбу здесь' : `Перейти на ${inspectedLocation.name} и ловить`}
              </span>
            </button>
          ) : (
            <div
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '14px',
                background: 'rgba(30, 41, 59, 0.65)',
                border: '1px dashed rgba(239, 68, 68, 0.45)',
                color: '#fca5a5',
                fontSize: '11.5px',
                fontWeight: 700,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>🔒</span>
              <span>Откроется на {inspectedLocation.levelReq} уровне (ваш ур.: {playerLevel})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};