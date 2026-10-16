import { useState } from 'react';
import type { FishingLocation } from '../locationsData';
import { ROD_TIERS, type PlayerGearState } from '../gearData';
import { AVAILABLE_BAITS } from '../hooks/useBaitState';
import { APP_VERSION } from '../version';

// --- SVG-иконки для реалистичного визуала снастей из референса ---
export const BobberIcon = ({ size = 32 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    style={{
      transform: 'rotate(-25deg)',
      filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.45))',
    }}
  >
    {/* Верхняя антенна с красным шариком */}
    <line x1="20" y1="2" x2="20" y2="12" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="20" cy="3" r="2.2" fill="#ef4444" />

    {/* Верхняя часть тела поплавка (ярко-оранжево-красная) */}
    <path
      d="M13 18 C13 13, 27 13, 27 18 L26.5 21 C26.5 21, 20 22.5, 13.5 21 Z"
      fill="url(#bobberRedGrad)"
    />

    {/* Белая разделительная полоса */}
    <rect x="13.2" y="20.5" width="13.6" height="2.8" rx="0.6" fill="#f8fafc" />

    {/* Нижняя часть тела (оливково-зелёная как на мокапе) */}
    <path
      d="M13.2 23 C13.2 28.5, 16.5 33.5, 20 35.5 C23.5 33.5, 26.8 28.5, 26.8 23 Z"
      fill="url(#bobberGreenGrad)"
    />

    {/* Нижний киль */}
    <line x1="20" y1="35.5" x2="20" y2="39.5" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />

    {/* Блик света */}
    <path
      d="M16 15 C16 13.5, 17.5 13, 18 13 L17.5 30"
      stroke="rgba(255, 255, 255, 0.45)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />

    <defs>
      <linearGradient id="bobberRedGrad" x1="13" y1="13" x2="27" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fb923c" />
        <stop offset="1" stopColor="#dc2626" />
      </linearGradient>
      <linearGradient id="bobberGreenGrad" x1="13" y1="23" x2="27" y2="35" gradientUnits="userSpaceOnUse">
        <stop stopColor="#84cc16" />
        <stop offset="1" stopColor="#3f6212" />
      </linearGradient>
    </defs>
  </svg>
);

export const RodIcon = ({ material = 'bamboo' }: { material?: string }) => {
  const isDark = material === 'carbon' || material === 'composite';
  const isGold = material === 'gold';
  const rodStroke = isGold ? '#eab308' : isDark ? '#475569' : '#b45309';
  const handleStroke = isGold ? '#ca8a04' : '#d97706';

  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 40 40"
      fill="none"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))' }}
    >
      {/* Бланк удилища по диагонали */}
      <line
        x1="6"
        y1="34"
        x2="34"
        y2="6"
        stroke={rodStroke}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="22"
        x2="34"
        y2="6"
        stroke="#cbd5e1"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Рукоять удилища */}
      <line
        x1="6.5"
        y1="33.5"
        x2="14.5"
        y2="25.5"
        stroke={handleStroke}
        strokeWidth="5.2"
        strokeLinecap="round"
      />

      {/* Пропускные кольца */}
      <circle cx="21" cy="19" r="2.2" stroke="#cbd5e1" strokeWidth="1.2" fill="none" />
      <circle cx="27" cy="13" r="1.8" stroke="#cbd5e1" strokeWidth="1.2" fill="none" />
      <circle cx="33" cy="7" r="1.4" stroke="#cbd5e1" strokeWidth="1.2" fill="none" />

      {/* Катушка */}
      <circle cx="12.5" cy="27.5" r="3.4" fill="#334155" stroke="#94a3b8" strokeWidth="1.2" />
      <circle cx="12.5" cy="27.5" r="1.5" fill="#f8fafc" />

      {/* Леска */}
      <path
        d="M12.5 27.5 Q 20.5 21 34 6"
        stroke="rgba(255, 255, 255, 0.85)"
        strokeWidth="0.9"
        fill="none"
        strokeDasharray="2 1"
      />
    </svg>
  );
};

export const BaitIcon = ({ baitId }: { baitId: string }) => {
  if (baitId === 'worm') {
    return (
      <svg
        width="34"
        height="34"
        viewBox="0 0 36 36"
        fill="none"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))' }}
      >
        <path
          d="M7 25 C 9 17, 14 16, 17 21 C 20 26, 26 26, 29 18 C 31 13, 27 10, 24 12"
          stroke="#f43f5e"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="24" cy="12" r="2.5" fill="#fb7185" />
      </svg>
    );
  }

  // По умолчанию: аппетитный батон / мякиш хлеба в точности как на референсе
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))' }}
    >
      <ellipse
        cx="18"
        cy="18"
        rx="13.5"
        ry="9"
        transform="rotate(-15 18 18)"
        fill="url(#breadCrustGrad)"
      />
      <ellipse
        cx="18"
        cy="17"
        rx="11.5"
        ry="7"
        transform="rotate(-15 18 17)"
        fill="url(#breadInsideGrad)"
      />
      <line
        x1="12"
        y1="13"
        x2="14"
        y2="19"
        stroke="#9a3412"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="17"
        y1="12"
        x2="19"
        y2="18"
        stroke="#9a3412"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="11"
        x2="24"
        y2="17"
        stroke="#9a3412"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="breadCrustGrad" x1="6" y1="10" x2="30" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" />
          <stop offset="1" stopColor="#9a3412" />
        </linearGradient>
        <linearGradient id="breadInsideGrad" x1="8" y1="11" x2="28" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef3c7" />
          <stop offset="1" stopColor="#fde68a" />
        </linearGradient>
      </defs>
    </svg>
  );
};

interface HomeScreenProps {
  currentLocation: FishingLocation;
  gear: PlayerGearState;
  userName: string;
  level: number;
  exp: number;
  maxExp: number;
  coins: number;
  energy: number;
  maxEnergy: number;
  inventoryCount: number;
  maxKeepnetCapacity: number;
  selectedBaitId: string;
  baits: Record<string, number>;
  onSelectBait: (baitId: string) => void;
  onEquipRod?: (rodId: string) => void;
  onGoFishing: () => void;
  onOpenMap: () => void;
  onOpenShop: () => void;
  onOpenInventory: () => void;
  onResetProgress?: () => void;
}

export const HomeScreen = ({
  currentLocation,
  gear,
  userName,
  level,
  exp,
  maxExp,
  coins,
  energy,
  maxEnergy,
  selectedBaitId,
  baits,
  onSelectBait,
  onEquipRod,
  onGoFishing,
  onOpenMap,
  onOpenShop,
  onResetProgress,
}: HomeScreenProps) => {
  const currentRod = ROD_TIERS.find((r) => r.id === gear.equippedRodId) || ROD_TIERS[0];
  const rodLevel = gear.rodLevels[gear.equippedRodId] || 1;
  const currentBait = AVAILABLE_BAITS.find((b) => b.id === selectedBaitId) || AVAILABLE_BAITS[0];
  const currentBaitCount = baits[selectedBaitId] || 0;

  // Интерактивные модальные окна
  const [activeModal, setActiveModal] = useState<
    'quests' | 'tournament' | 'weather' | 'settings' | 'baitSelect' | 'rodSelect' | 'leaderboard' | 'achievements' | null
  >(null);

  const expPercentage = Math.min(100, Math.max(0, (exp / maxExp) * 100));

  const handleReset = () => {
    const confirmed = window.confirm('Точно сбросить весь прогресс до 1 уровня?');
    if (confirmed) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
        userSelect: 'none',
        backgroundImage: 'url(/assets/locations/main_fishing_dock.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        padding: '14px 12px',
      }}
    >
      {/* Мягкое виньетирование для глубины сцены */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 45%, rgba(0, 0, 0, 0) 35%, rgba(10, 18, 30, 0.55) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* 1. Верхний разгруженный и укрупнённый бар (Header) */}
      {/* 1. Верхний разгруженный бар-капсула в точности по референсу */}
      <div
        style={{
          position: 'relative',
          zIndex: 15,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(22, 28, 38, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '24px',
          padding: '7px 10px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 8px 28px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Аватар + Имя + Уровень + Опыт */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              border: '2px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.55)',
              flexShrink: 0,
            }}
          >
            🧔
          </div>

          <div>
            <div
              style={{
                fontSize: '13.5px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: '0.2px',
              }}
            >
              {userName || 'Igor'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 800,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.18)',
                  padding: '1px 5px',
                  borderRadius: '5px',
                }}
              >
                Ур. {level}
              </span>
              <div
                style={{
                  width: '54px',
                  height: '4.5px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${expPercentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ресурсы: Монеты, Термос энергии и Настройки */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Монеты */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(30, 41, 59, 0.85)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '14px',
              padding: '5px 8px',
              color: '#fbbf24',
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            <span style={{ fontSize: '13px' }}>🪙</span>
            <span>{coins.toLocaleString('ru-RU')}</span>
          </div>

          {/* Термос / Энергия */}
          <div
            title="Энергия рыбака"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(30, 41, 59, 0.85)',
              border: '1px solid rgba(250, 204, 21, 0.35)',
              borderRadius: '14px',
              padding: '5px 7px',
              color: '#fef08a',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            <span style={{ fontSize: '12px' }}>⚡</span>
            <span>
              {energy}/{maxEnergy}
            </span>
            <span
              style={{
                fontSize: '10px',
                color: '#facc15',
                background: 'rgba(250, 204, 21, 0.25)',
                borderRadius: '50%',
                width: '13px',
                height: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '2px',
              }}
            >
              +
            </span>
          </div>

          {/* Кнопка настроек */}
          <button
            onClick={() => setActiveModal('settings')}
            title="Настройки"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 2. Верхне-центральная зона: Виджеты локации/погоды слева + Столбец жетонов справа */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginTop: '10px',
        }}
      >
        {/* Левая группа: Локация и Погода в точности как на референсе */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Виджет локации */}
          <div
            onClick={onOpenMap}
            style={{
              width: '88px',
              height: '92px',
              background: 'rgba(22, 28, 38, 0.78)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '20px',
              padding: '8px 6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
              transition: 'transform 0.12s ease',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
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
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: '#ffffff',
                marginTop: '6px',
                textAlign: 'center',
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '78px',
              }}
            >
              {currentLocation.name.replace('водоём', '').trim()} &gt;
            </div>
          </div>

          {/* Виджет погоды */}
          <div
            onClick={() => setActiveModal('weather')}
            style={{
              width: '88px',
              height: '92px',
              background: 'rgba(22, 28, 38, 0.78)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '20px',
              padding: '8px 6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
              transition: 'transform 0.12s ease',
            }}
          >
            <span style={{ fontSize: '24px', filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.65))' }}>
              ☀️
            </span>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 900,
                color: '#ffffff',
                marginTop: '2px',
                lineHeight: 1.1,
              }}
            >
              +21°
            </div>
            <div
              style={{
                fontSize: '8.5px',
                color: '#cbd5e1',
                marginTop: '3px',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Отличный клёв
            </div>
          </div>
        </div>

        {/* Правый вертикальный стек жетонов (Турнир, Лидерборд, Квесты, Достижения) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Карточка турнира */}
          <div
            onClick={() => setActiveModal('tournament')}
            style={{
              width: '68px',
              background: 'rgba(22, 28, 38, 0.8)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '18px',
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)',
            }}
          >
            <span style={{ fontSize: '24px', filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.6))' }}>
              🏆
            </span>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#fef08a',
                marginTop: '2px',
                lineHeight: 1.1,
              }}
            >
              Турнир
            </div>
            <div style={{ fontSize: '8.5px', color: '#94a3b8', marginTop: '2px' }}>
              14ч 32м
            </div>
          </div>

          {/* Жетон Лидерборда (Медаль) */}
          <button
            onClick={() => setActiveModal('leaderboard')}
            title="Лидерборд"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(22, 28, 38, 0.82)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(245, 158, 11, 0.45)',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.45), 0 0 10px rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            🏅
          </button>

          {/* Жетон Квестов (Свиток с красной точкой !) */}
          <button
            onClick={() => setActiveModal('quests')}
            title="Квесты егеря"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(22, 28, 38, 0.82)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(245, 158, 11, 0.45)',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.45), 0 0 10px rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              cursor: 'pointer',
              position: 'relative',
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                background: '#ef4444',
                color: '#fff',
                fontSize: '8.5px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 6px rgba(239, 68, 68, 0.85)',
              }}
            >
              !
            </span>
            📜
          </button>

          {/* Жетон Достижений (Золотая звезда) */}
          <button
            onClick={() => setActiveModal('achievements')}
            title="Достижения"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(22, 28, 38, 0.82)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(245, 158, 11, 0.45)',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.45), 0 0 10px rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ⭐
          </button>
        </div>
      </div>

      {/* 3. Нижний блок снастей (Action Dock прямо над мостиком в точности по референсу) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          marginBottom: '6px',
        }}
      >
        {/* Удилище (слева, вертикальная карточка в точности по референсу) */}
        <div
          onClick={() => setActiveModal('rodSelect')}
          style={{
            width: '74px',
            flexShrink: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '18px',
            padding: '8px 4px 7px 4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
            transition: 'transform 0.12s ease',
          }}
        >
          {/* Квадратный слот с иконкой снасти */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.3)',
              position: 'relative',
            }}
          >
            <RodIcon material={currentRod.material} />
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'rgba(56, 189, 248, 0.95)',
                color: '#0f172a',
                fontSize: '9px',
                fontWeight: 900,
                borderRadius: '6px',
                padding: '0 4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
              }}
            >
              {rodLevel} ур.
            </span>
          </div>

          <div
            style={{
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              textAlign: 'center',
              marginTop: '6px',
            }}
          >
            Удочка
          </div>
        </div>

        {/* Кнопка «ЗАБРОСИТЬ» (по центру, сочная лаймовая с волнами поплавка) */}
        <button
          onClick={onGoFishing}
          style={{
            flex: 1,
            height: '62px',
            background: 'linear-gradient(180deg, #84cc16 0%, #65a30d 50%, #4d7c0f 100%)',
            border: '2.5px solid #bef264',
            borderRadius: '31px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: 900,
            letterSpacing: '0.8px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            boxShadow:
              '0 0 28px rgba(132, 204, 22, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.6), 0 8px 24px rgba(0, 0, 0, 0.45)',
            cursor: 'pointer',
            transition: 'transform 0.1s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '-8px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.75)',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              ((
            </span>
            <BobberIcon size={34} />
            <span
              style={{
                position: 'absolute',
                right: '-8px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.75)',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              ))
            </span>
          </div>
          <span>ЗАБРОСИТЬ</span>
        </button>

        {/* Наживка (справа, вертикальная карточка в точности по референсу) */}
        <div
          onClick={() => setActiveModal('baitSelect')}
          style={{
            width: '74px',
            flexShrink: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '18px',
            padding: '8px 4px 7px 4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
            transition: 'transform 0.12s ease',
          }}
        >
          {/* Квадратный слот с иконкой наживки */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            <BaitIcon baitId={currentBait.id} />
          </div>

          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#ffffff',
              marginTop: '5px',
              lineHeight: 1.1,
              textAlign: 'center',
            }}
          >
            Наживка
          </div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: currentBaitCount > 0 ? '#4ade80' : '#ef4444',
              lineHeight: 1.2,
              textAlign: 'center',
              marginTop: '2px',
            }}
          >
            {currentBaitCount} шт.
          </div>
        </div>
      </div>

      {/* 4. Интерактивные модальные окна */}
      {/* Выбор удилища прямо на мостике */}
      {activeModal === 'rodSelect' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-end',
            padding: '12px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#0f172a',
              borderRadius: '24px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                Ваши удилища 🎣
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '240px',
                overflowY: 'auto',
              }}
            >
              {ROD_TIERS.filter((r) => gear.ownedRods.includes(r.id)).map((rod) => {
                const isSelected = gear.equippedRodId === rod.id;
                const rLevel = gear.rodLevels[rod.id] || 1;
                return (
                  <button
                    key={rod.id}
                    onClick={() => {
                      if (onEquipRod) onEquipRod(rod.id);
                      setActiveModal(null);
                    }}
                    style={{
                      background: isSelected
                        ? 'rgba(56, 189, 248, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected
                        ? '1px solid #38bdf8'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '14px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      color: '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <RodIcon material={rod.material} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>
                          {rod.name} [{rLevel} ур.]
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                          Прочность: {rod.baseStrengthKg} - {rod.maxStrengthKg} кг
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800 }}>
                        Экипировано ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                onOpenShop();
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                border: 'none',
                color: '#fff',
                fontWeight: 800,
                padding: '11px',
                borderRadius: '14px',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>🏪</span>
              <span>Магазин новых удилищ</span>
            </button>
          </div>
        </div>
      )}

      {/* Выбор наживки прямо на мостике */}
      {activeModal === 'baitSelect' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-end',
            padding: '12px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#0f172a',
              borderRadius: '24px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                Выберите наживку
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {AVAILABLE_BAITS.map((b) => {
                const count = baits[b.id] || 0;
                const isSelected = selectedBaitId === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectBait(b.id);
                      setActiveModal(null);
                    }}
                    style={{
                      background: isSelected
                        ? 'rgba(56, 189, 248, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected
                        ? '1px solid #38bdf8'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '14px',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: '#fff',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{b.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700 }}>{b.name}</div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: count > 0 ? '#4ade80' : '#ef4444',
                          fontWeight: 600,
                        }}
                      >
                        {count > 0 ? `${count} шт.` : 'Нет в наличии'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Лидерборд */}
      {activeModal === 'leaderboard' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              borderRadius: '24px',
              padding: '20px',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              maxWidth: '320px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#fbbf24', marginBottom: '6px' }}>
              Клуб и Лидерборд
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Соревнуйтесь с другими рыболовами за самые крупные трофеи недели и сезонные призы!
            </p>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '14px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                textAlign: 'left',
                fontSize: '11px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fef08a' }}>
                <span>🥇 1. Старый_Окунь</span>
                <span style={{ fontWeight: 800 }}>Карп 8.4 кг</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0' }}>
                <span>🥈 2. {userName || 'Рыболов'} (Вы)</span>
                <span style={{ fontWeight: 800 }}>Ур. {level}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>🥉 3. Клёвый_Парень</span>
                <span style={{ fontWeight: 800 }}>Щука 4.2 кг</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                color: '#fff',
                fontWeight: 800,
                padding: '11px',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Достижения */}
      {activeModal === 'achievements' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              borderRadius: '24px',
              padding: '20px',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              maxWidth: '320px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>⭐</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#c084fc', marginBottom: '6px' }}>
              Книга Достижений
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Открывайте трофеи и получайте награды за мастерство на водоёмах!
            </p>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '14px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                textAlign: 'left',
                fontSize: '11px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                <span>🎣 Первый заброс</span>
                <span style={{ fontWeight: 800 }}>Выполнено ✓</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0' }}>
                <span>🐟 Гроза карасей (10 шт.)</span>
                <span style={{ fontWeight: 800, color: '#facc15' }}>В процессе</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>🐊 Трофейная щука</span>
                <span>Заблокировано</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                border: 'none',
                color: '#fff',
                fontWeight: 800,
                padding: '11px',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Квесты егеря */}
      {activeModal === 'quests' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              borderRadius: '24px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              maxWidth: '320px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>🕵️‍♂️</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Квесты егеря
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              «Здорово, рыбак! Я местный егерь. В следующем обновлении я буду выдавать тебе особые
              задания на отлов редких рыб с ценными наградами!»
            </p>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                marginTop: '16px',
                width: '100%',
                background: '#0284c7',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                padding: '10px',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Понятно, жду! 👍
            </button>
          </div>
        </div>
      )}

      {/* Ежедневный турнир */}
      {activeModal === 'tournament' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              borderRadius: '24px',
              padding: '20px',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              maxWidth: '320px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fbbf24', marginBottom: '6px' }}>
              Ежедневный турнир
            </div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
              Турнир: <strong>«Золотой карась»</strong>.<br />
              Поймайте самого крупного карася за день.
              <br />
              Призовой фонд: <strong>🪙 5,000 монет</strong>!
            </p>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
              До окончания: <strong>14 часов 32 минуты</strong>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                marginTop: '16px',
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                padding: '10px',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Отлично 🎣
            </button>
          </div>
        </div>
      )}

      {/* Погода */}
      {activeModal === 'weather' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              borderRadius: '24px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              maxWidth: '320px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>🌤️</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#bae6fd', marginBottom: '6px' }}>
              Сводка погоды
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              Локация: <strong>{currentLocation.name}</strong>
              <br />
              Температура: <strong>+21°C</strong>
              <br />
              Ветер: <strong>Юго-восточный, 1.8 м/с (штиль)</strong>
              <br />
              Давление: <strong>750 мм рт. ст.</strong>
              <br />
              Прогноз клёва: <span style={{ color: '#4ade80', fontWeight: 700 }}>Отличный</span>
            </p>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                marginTop: '16px',
                width: '100%',
                background: '#0284c7',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                padding: '10px',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Настройки */}
      {activeModal === 'settings' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              borderRadius: '24px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              maxWidth: '320px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>⚙️</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              Настройки игры
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '16px' }}>
              Версия: {APP_VERSION}
            </div>

            <button
              onClick={onResetProgress || handleReset}
              style={{
                width: '100%',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                borderRadius: '12px',
                padding: '10px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Сбросить весь прогресс
            </button>

            <button
              onClick={() => setActiveModal(null)}
              style={{
                marginTop: '10px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                padding: '10px',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Назад
            </button>
          </div>
        </div>
      )}
    </div>
  );
};