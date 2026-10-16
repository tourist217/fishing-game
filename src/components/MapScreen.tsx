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
  loc_forest_lake: { label: 'Переменная облачность', icon: '⛅', temp: '+20°C' },
  loc_quiet_river: { label: 'Лёгкий ветерок', icon: '🌤️', temp: '+21°C' },
  loc_beaver_backwater: { label: 'Теплый дождик', icon: '🌦️', temp: '+18°C' },
  loc_wide_reach: { label: 'Свежий бриз', icon: '💨', temp: '+19°C' },
  loc_reservoir: { label: 'Солнечно с рябью', icon: '🌊', temp: '+23°C' },
  loc_oka_river: { label: 'Ясно, быстроток', icon: '☀️', temp: '+21°C' },
  loc_lower_volga: { label: 'Жарко, штиль', icon: '☀️', temp: '+27°C' },
  loc_ladoga_lake: { label: 'Прохладно, туман', icon: '☁️', temp: '+14°C' },
  loc_akhtuba_pits: { label: 'Сумерки, теплынь', icon: '🌅', temp: '+24°C' },
  loc_caspian_delta: { label: 'Золотой закат', icon: '👑', temp: '+26°C' },
};

// Координаты точек на вертикальной карте (в процентах по X и пикселях по Y)
// Размещаем снизу вверх: от Деревенского пруда (низ) до Дельты Каспия (верх)
const MAP_TOTAL_HEIGHT = 1680;
const MAP_POINTS = [
  { id: 'loc_village_pond', x: 50, y: 1540 },
  { id: 'loc_old_oxbow', x: 26, y: 1400 },
  { id: 'loc_forest_lake', x: 74, y: 1260 },
  { id: 'loc_quiet_river', x: 32, y: 1120 },
  { id: 'loc_beaver_backwater', x: 68, y: 980 },
  { id: 'loc_wide_reach', x: 28, y: 840 },
  { id: 'loc_reservoir', x: 72, y: 700 },
  { id: 'loc_oka_river', x: 30, y: 560 },
  { id: 'loc_lower_volga', x: 70, y: 430 },
  { id: 'loc_ladoga_lake', x: 32, y: 310 },
  { id: 'loc_akhtuba_pits', x: 68, y: 190 },
  { id: 'loc_caspian_delta', x: 50, y: 80 },
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

  // Текущая выбранная локация для инспектора
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

  // Плавный скролл к выбранной локации при первом рендере карты
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
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: '#09151f',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
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
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '18px',
          padding: '6px 10px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.4)',
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

        {/* Переключатель: Интерактивная карта / Список */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '2px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            onClick={() => setViewMode('map')}
            style={{
              padding: '4px 9px',
              borderRadius: '10px',
              border: 'none',
              background: viewMode === 'map' ? '#22c55e' : 'transparent',
              color: viewMode === 'map' ? '#ffffff' : '#94a3b8',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Река
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '4px 9px',
              borderRadius: '10px',
              border: 'none',
              background: viewMode === 'list' ? '#22c55e' : 'transparent',
              color: viewMode === 'list' ? '#ffffff' : '#94a3b8',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Список
          </button>
        </div>
      </div>

      {/* РЕЖИМ 1: ИНТЕРАКТИВНАЯ КАРТА (С ВЕРТИКАЛЬНЫМ СКРОЛЛОМ) */}
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
          {/* Холст карты с ландшафтом и рекой */}
          <div
            style={{
              width: '100%',
              height: `${MAP_TOTAL_HEIGHT}px`,
              position: 'relative',
              background:
                'linear-gradient(180deg, #1e293b 0%, #134e4a 20%, #15803d 45%, #166534 68%, #22c55e 88%, #86efac 100%)',
            }}
          >
            {/* Векторный ландшафт: извилистая река и золотая тропа */}
            <svg
              width="100%"
              height={MAP_TOTAL_HEIGHT}
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
              viewBox={`0 0 360 ${MAP_TOTAL_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <defs>
                {/* Градиент воды */}
                <linearGradient id="riverWater" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="30%" stopColor="#0284c7" />
                  <stop offset="60%" stopColor="#0369a1" />
                  <stop offset="100%" stopColor="#075985" />
                </linearGradient>

                {/* Береговой песок */}
                <linearGradient id="sandBank" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#78350f" stopOpacity="0.3" />
                </linearGradient>

                {/* Фильтр свечения тропы */}
                <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#fde047" floodOpacity="0.7" />
                </filter>
              </defs>

              {/* Береговая линия реки */}
              <path
                d={`
                  M 180 0
                  C 280 150, 310 250, 240 380
                  C 170 510, 80 620, 150 780
                  C 220 940, 290 1060, 200 1200
                  C 110 1340, 80 1440, 180 1580
                  L 200 1680
                `}
                stroke="url(#sandBank)"
                strokeWidth="56"
                strokeLinecap="round"
                fill="none"
              />

              {/* Основное русло реки с бликами */}
              <path
                d={`
                  M 180 0
                  C 280 150, 310 250, 240 380
                  C 170 510, 80 620, 150 780
                  C 220 940, 290 1060, 200 1200
                  C 110 1340, 80 1440, 180 1580
                  L 200 1680
                `}
                stroke="url(#riverWater)"
                strokeWidth="42"
                strokeLinecap="round"
                fill="none"
              />

              {/* Внутренние струи и рябь воды */}
              <path
                d={`
                  M 180 0
                  C 280 150, 310 250, 240 380
                  C 170 510, 80 620, 150 780
                  C 220 940, 290 1060, 200 1200
                  C 110 1340, 80 1440, 180 1580
                  L 200 1680
                `}
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="6"
                strokeDasharray="16 28"
                fill="none"
              />

              {/* Золотая соединительная тропа между локациями */}
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
                    strokeWidth="4.5"
                    strokeDasharray="6 8"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#glowGold)"
                  />
                );
              })}
            </svg>

            {/* Декоративные элементы ландшафта (деревья, мостки, скалы) */}
            <div style={{ position: 'absolute', top: 30, left: 20, fontSize: '28px', opacity: 0.85 }}>
              ⛰️
            </div>
            <div style={{ position: 'absolute', top: 50, right: 30, fontSize: '24px', opacity: 0.9 }}>
              🏔️
            </div>
            <div style={{ position: 'absolute', top: 220, left: 30, fontSize: '22px', opacity: 0.8 }}>
              🌲
            </div>
            <div style={{ position: 'absolute', top: 360, right: 25, fontSize: '24px', opacity: 0.85 }}>
              🌲🌲
            </div>
            <div style={{ position: 'absolute', top: 620, left: 20, fontSize: '22px', opacity: 0.8 }}>
              🌲
            </div>
            <div style={{ position: 'absolute', top: 890, right: 20, fontSize: '22px', opacity: 0.85 }}>
              🌳
            </div>
            <div style={{ position: 'absolute', top: 1180, left: 16, fontSize: '22px', opacity: 0.8 }}>
              🌿
            </div>
            <div style={{ position: 'absolute', top: 1470, right: 30, fontSize: '24px', opacity: 0.85 }}>
              🏡
            </div>
            <div style={{ position: 'absolute', top: 1610, left: 45, fontSize: '22px', opacity: 0.85 }}>
              🪵🪷
            </div>

            {/* Точки локаций (Nodes) на карте */}
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
                    zIndex: isSelected ? 20 : 10,
                    transition: 'transform 0.2s ease',
                  }}
                >
                  {/* Пульсирующие кольца вокруг выбранной или текущей локации */}
                  {(isSelected || isCurrent) && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '64px',
                        height: '64px',
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        border: isSelected ? '2.5px solid #facc15' : '2px solid #38bdf8',
                        background: isSelected
                          ? 'radial-gradient(circle, rgba(250, 204, 21, 0.3) 0%, transparent 70%)'
                          : 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)',
                        animation: 'pulse 1.8s infinite ease-in-out',
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* Основная кнопка-пин точки */}
                  <div
                    style={{
                      width: isSelected ? '54px' : '46px',
                      height: isSelected ? '54px' : '46px',
                      borderRadius: '50%',
                      background: isUnlocked
                        ? isCurrent
                          ? 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)'
                          : isSelected
                          ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)'
                          : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                        : 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
                      border: isSelected
                        ? '3px solid #fef08a'
                        : isCurrent
                        ? '3px solid #bbf7d0'
                        : isUnlocked
                        ? '2px solid #bae6fd'
                        : '2px solid #64748b',
                      boxShadow: isSelected
                        ? '0 0 20px rgba(250, 204, 21, 0.8), 0 6px 16px rgba(0,0,0,0.5)'
                        : isCurrent
                        ? '0 0 16px rgba(34, 197, 94, 0.7), 0 4px 12px rgba(0,0,0,0.5)'
                        : '0 4px 12px rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isSelected ? '24px' : '20px',
                      position: 'relative',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    {isUnlocked ? (
                      loc.icon
                    ) : (
                      <span style={{ fontSize: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
                        🔒
                      </span>
                    )}

                    {/* Маленький бейдж уровня в углу пина */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-4px',
                        background: isUnlocked ? '#15803d' : '#334155',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        color: '#ffffff',
                        fontSize: '9px',
                        fontWeight: 900,
                        padding: '1px 4px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                      }}
                    >
                      {loc.levelReq}
                    </span>
                  </div>

                  {/* Текстовая плашка названия локации */}
                  <div
                    style={{
                      marginTop: '4px',
                      background: isSelected
                        ? 'rgba(15, 23, 42, 0.95)'
                        : 'rgba(15, 23, 42, 0.82)',
                      backdropFilter: 'blur(10px)',
                      border: isSelected
                        ? '1.5px solid #facc15'
                        : isCurrent
                        ? '1.5px solid #4ade80'
                        : '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: '12px',
                      padding: '3px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      whiteSpace: 'nowrap',
                      maxWidth: '135px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: isSelected ? '#fde047' : isCurrent ? '#4ade80' : isUnlocked ? '#ffffff' : '#94a3b8',
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

          {/* Плавающая кнопка быстрого перехода к текущему водоёму */}
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
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(12px)',
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

      {/* НИЖНЯЯ ВСПЛЫВАЮЩАЯ КАРТОЧКА ИНСПЕКТОРА ВОДОЁМА (PREVIEW MODAL) */}
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
                ? '1.5px solid #4ade80'
                : '1.5px solid #38bdf8'
              : '1.5px solid rgba(239, 68, 68, 0.4)',
            padding: '12px 14px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'slideUp 0.22s ease-out',
          }}
        >
          {/* Верхняя строка карточки: название, погода, закрыть */}
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
                  border: '1px solid rgba(255, 255, 255, 0.15)',
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
                        ? '1px solid rgba(34, 197, 94, 0.35)'
                        : '1px solid rgba(239, 68, 68, 0.35)',
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
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#94a3b8',
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

          {/* Виды обитающей рыбы */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Рыба:
            </span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'nowrap' }}>
              {inspectedFish.slice(0, 5).map((fish) => (
                <span
                  key={fish.id}
                  style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
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
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
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

          {/* Кнопка действия: Ловить рыбу или заблокировано */}
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
                boxShadow: '0 4px 18px rgba(34, 197, 94, 0.45)',
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
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px dashed rgba(239, 68, 68, 0.4)',
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