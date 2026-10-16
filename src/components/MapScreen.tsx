import React, { useState, useRef, useEffect } from 'react';
import { LOCATIONS, type FishingLocation } from '../locationsData';
import { FISH_DATABASE } from '../fishData';

interface MapScreenProps {
  playerLevel: number;
  currentLocationId: string;
  onSelectLocation: (loc: FishingLocation) => void;
  onGoFishing: () => void;
}

// Погодные условия для каждого водоёма
const LOCATION_WEATHER: Record<string, { label: string; icon: string; temp: string }> = {
  loc_village_pond: { label: 'Ясно, штиль', icon: '☀️', temp: '+22°C' },
  loc_old_oxbow: { label: 'Утренняя дымка', icon: '🌫️', temp: '+19°C' },
  loc_forest_lake: { label: 'Солнечно, сосны', icon: '🌲', temp: '+20°C' },
  loc_quiet_river: { label: 'Лёгкий ветерок', icon: '🌤️', temp: '+21°C' },
  loc_beaver_backwater: { label: 'Теплый дождик', icon: '🌦️', temp: '+18°C' },
  loc_wide_reach: { label: 'Свежий бриз', icon: '💨', temp: '+19°C' },
  loc_reservoir: { label: 'Солнце и рябь', icon: '🌊', temp: '+23°C' },
  loc_oka_river: { label: 'Ясно, быстроток', icon: '☀️', temp: '+21°C' },
  loc_lower_volga: { label: 'Жарко, штиль', icon: '☀️', temp: '+27°C' },
  loc_ladoga_lake: { label: 'Прохладно, туман', icon: '☁️', temp: '+14°C' },
  loc_akhtuba_pits: { label: 'Сумерки, омуты', icon: '🌅', temp: '+24°C' },
  loc_caspian_delta: { label: 'Золотой закат', icon: '👑', temp: '+26°C' },
};

// Точки привязаны точно к реальным географическим ориентирам на 3D-арте реки (снизу вверх)
const MAP_TOTAL_HEIGHT = 1680;
const MAP_POINTS = [
  { id: 'loc_village_pond', x: 48, y: 1470 }, // Уютный деревянный мостик с лодкой внизу
  { id: 'loc_old_oxbow', x: 68, y: 1320 },    // Изгиб реки среди цветочного луга справа
  { id: 'loc_forest_lake', x: 33, y: 1180 },  // Заводь у камышей слева
  { id: 'loc_quiet_river', x: 52, y: 1040 },  // Плавное течение на выходе из леса
  { id: 'loc_beaver_backwater', x: 68, y: 910 }, // Скалистый перешеек среди сосен
  { id: 'loc_wide_reach', x: 50, y: 780 },    // Нижний срез лазурного горного озера
  { id: 'loc_reservoir', x: 32, y: 650 },     // Центральная гладь горного озера слева
  { id: 'loc_oka_river', x: 66, y: 530 },     // Бурный приток водопада справа
  { id: 'loc_lower_volga', x: 46, y: 410 },   // Каскад водопада среди сосен
  { id: 'loc_ladoga_lake', x: 30, y: 290 },   // Скалистый каньон
  { id: 'loc_akhtuba_pits', x: 68, y: 180 },  // Верхнее горное ущелье
  { id: 'loc_caspian_delta', x: 54, y: 80 },  // Ледники и исток главного водопада
];

export const MapScreen: React.FC<MapScreenProps> = ({
  playerLevel,
  currentLocationId,
  onSelectLocation,
  onGoFishing,
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
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
    if (viewMode === 'map' && scrollContainerRef.current) {
      const point = MAP_POINTS.find((p) => p.id === currentLocationId);
      if (point) {
        const targetScrollTop = Math.max(0, point.y - 280);
        scrollContainerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        });
      }
    }
  }, [viewMode, currentLocationId]);

  const scrollToLocation = (locId: string) => {
    const point = MAP_POINTS.find((p) => p.id === locId);
    if (point && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: Math.max(0, point.y - 260),
        behavior: 'smooth',
      });
    }
  };

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
      {/* Стили анимаций для живой карты */}
      <style>{`
        @keyframes rippleRing {
          0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
        @keyframes pinBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes goldGlow {
          0%, 100% { filter: drop-shadow(0 0 4px #fde047) drop-shadow(0 0 10px rgba(250, 204, 21, 0.7)); }
          50% { filter: drop-shadow(0 0 8px #fef08a) drop-shadow(0 0 16px rgba(250, 204, 21, 0.9)); }
        }
      `}</style>

      {/* Верхняя компактная плашка-заголовок карты с переключателем режима */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 12,
          right: 12,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '18px',
          padding: '6px 10px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🗺️</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
              Карта водоёмов
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              {playerLevel} ур. • Открыто {LOCATIONS.filter((l) => playerLevel >= l.levelReq).length}/{LOCATIONS.length}
            </div>
          </div>
        </div>

        {/* Переключатель: Живая река / Список */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '2px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <button
            onClick={() => setViewMode('map')}
            style={{
              padding: '4px 10px',
              borderRadius: '10px',
              border: 'none',
              background: viewMode === 'map' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'transparent',
              color: viewMode === 'map' ? '#ffffff' : '#94a3b8',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: viewMode === 'map' ? '0 2px 8px rgba(34, 197, 94, 0.4)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            Река
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '4px 10px',
              borderRadius: '10px',
              border: 'none',
              background: viewMode === 'list' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'transparent',
              color: viewMode === 'list' ? '#ffffff' : '#94a3b8',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: viewMode === 'list' ? '0 2px 8px rgba(34, 197, 94, 0.4)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            Список
          </button>
        </div>
      </div>

      {/* РЕЖИМ 1: НАСТОЯЩАЯ 3D-КАРТА (НАЛОЖЕНИЕ ИНТЕРАКТИВНЫХ ЭЛЕМЕНТОВ НА АРТ) */}
      {viewMode === 'map' && (
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
          {/* Контейнер с фоновым артом высокого разрешения */}
          <div
            style={{
              width: '100%',
              height: `${MAP_TOTAL_HEIGHT}px`,
              position: 'relative',
              backgroundImage: "url('/assets/locations/river_world_map.jpg')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center top',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Тонкое атмосферное виньетирование для глубины */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(10,22,34,0.3) 0%, transparent 12%, transparent 88%, rgba(10,22,34,0.4) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Золотая сияющая тропа, соединяющая водоёмы по руслу реки */}
            <svg
              width="100%"
              height={MAP_TOTAL_HEIGHT}
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
              viewBox={`0 0 360 ${MAP_TOTAL_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="goldPathGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#fde047" floodOpacity="0.85" />
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* Соединительная тропа */}
              {MAP_POINTS.map((pt, idx) => {
                if (idx === 0) return null;
                const prev = MAP_POINTS[idx - 1];
                const x1 = (prev.x / 100) * 360;
                const y1 = prev.y;
                const x2 = (pt.x / 100) * 360;
                const y2 = pt.y;

                // Плавная кривая Безье вдоль русла
                const cx1 = x1;
                const cy1 = (y1 + y2) / 2;
                const cx2 = x2;
                const cy2 = (y1 + y2) / 2;

                return (
                  <path
                    key={`trail-${pt.id}`}
                    d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                    stroke="#fde047"
                    strokeWidth="4"
                    strokeDasharray="6 8"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#goldPathGlow)"
                  />
                );
              })}
            </svg>

            {/* Интерактивные точки (Nodes) поверх игрового арта */}
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
                  {/* Водные круги ряби под точкой */}
                  {(isSelected || isCurrent) && (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '68px',
                          height: '68px',
                          borderRadius: '50%',
                          border: isSelected ? '3px solid #fde047' : '2.5px solid #38bdf8',
                          animation: 'rippleRing 2s infinite ease-out',
                          pointerEvents: 'none',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '68px',
                          height: '68px',
                          borderRadius: '50%',
                          border: isSelected ? '2px solid #fde047' : '2px solid #38bdf8',
                          animation: 'rippleRing 2s infinite ease-out 1s',
                          pointerEvents: 'none',
                        }}
                      />
                    </>
                  )}

                  {/* 3D-кнопка пина водоёма */}
                  <div
                    style={{
                      width: isSelected ? '56px' : '48px',
                      height: isSelected ? '56px' : '48px',
                      borderRadius: '50%',
                      background: isUnlocked
                        ? isCurrent
                          ? 'linear-gradient(135deg, #4ade80 0%, #15803d 100%)'
                          : isSelected
                          ? 'linear-gradient(135deg, #fde047 0%, #d97706 100%)'
                          : 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)'
                        : 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
                      border: isSelected
                        ? '3.5px solid #ffffff'
                        : isCurrent
                        ? '3px solid #bbf7d0'
                        : isUnlocked
                        ? '2.5px solid #e0f2fe'
                        : '2px solid #94a3b8',
                      boxShadow: isSelected
                        ? '0 0 24px rgba(253, 224, 71, 0.95), 0 8px 18px rgba(0,0,0,0.6)'
                        : isCurrent
                        ? '0 0 20px rgba(74, 222, 128, 0.85), 0 6px 16px rgba(0,0,0,0.6)'
                        : '0 6px 14px rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isSelected ? '26px' : '22px',
                      position: 'relative',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      animation: isSelected ? 'pinBob 2s infinite ease-in-out' : 'none',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    {isUnlocked ? (
                      loc.icon
                    ) : (
                      <span style={{ fontSize: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
                        🔒
                      </span>
                    )}

                    {/* Бейдж требуемого уровня на пине */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-5px',
                        background: isUnlocked ? '#15803d' : '#1e293b',
                        border: '1.2px solid #ffffff',
                        color: '#ffffff',
                        fontSize: '9px',
                        fontWeight: 900,
                        padding: '1px 5px',
                        borderRadius: '7px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                      }}
                    >
                      {loc.levelReq}
                    </span>
                  </div>

                  {/* Плашка с названием водоёма */}
                  <div
                    style={{
                      marginTop: '5px',
                      background: isSelected
                        ? 'rgba(15, 23, 42, 0.95)'
                        : 'rgba(15, 23, 42, 0.84)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: isSelected
                        ? '1.8px solid #facc15'
                        : isCurrent
                        ? '1.8px solid #4ade80'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '3px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.55)',
                      whiteSpace: 'nowrap',
                      maxWidth: '140px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
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
                      <span style={{ fontSize: '10px', color: '#4ade80' }}>●</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Плавающая кнопка быстрого возврата к текущей локации игрока */}
          <button
            onClick={() => scrollToLocation(currentLocationId)}
            style={{
              position: 'fixed',
              bottom: showPreviewModal ? '240px' : '75px',
              right: '16px',
              zIndex: 35,
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1.5px solid #38bdf8',
              color: '#38bdf8',
              padding: '7px 12px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              transition: 'bottom 0.2s ease',
            }}
          >
            <span>🎯</span>
            <span>Мой водоём</span>
          </button>
        </div>
      )}

      {/* РЕЖИМ 2: КОМПАКТНЫЙ СПИСОК (АЛЬТЕРНАТИВНЫЙ ВИД) */}
      {viewMode === 'list' && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '56px 12px 14px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {LOCATIONS.map((loc) => {
            const isUnlocked = playerLevel >= loc.levelReq;
            const isCurrent = currentLocationId === loc.id;
            const isSelected = inspectedLocation.id === loc.id;
            const locWeather = LOCATION_WEATHER[loc.id] || { label: 'Ясно', icon: '☀️', temp: '+20°C' };

            return (
              <div
                key={loc.id}
                onClick={() => {
                  setSelectedLocId(loc.id);
                  setShowPreviewModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '16px',
                  background: isCurrent
                    ? 'rgba(34, 197, 94, 0.15)'
                    : isSelected
                    ? 'rgba(250, 204, 21, 0.12)'
                    : 'rgba(22, 28, 38, 0.85)',
                  border: isCurrent
                    ? '1.5px solid #22c55e'
                    : isSelected
                    ? '1.5px solid #facc15'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  opacity: isUnlocked ? 1 : 0.65,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: 'rgba(15, 23, 42, 0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}
                  >
                    {isUnlocked ? loc.icon : '🔒'}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                      {loc.name}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                      Ур. {loc.levelReq} • {locWeather.icon} {locWeather.temp}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '10.5px',
                      color: isCurrent ? '#4ade80' : isUnlocked ? '#38bdf8' : '#94a3b8',
                      fontWeight: 700,
                    }}
                  >
                    {isCurrent ? 'Вы здесь' : isUnlocked ? 'Выбрать' : `Ур. ${loc.levelReq}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

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