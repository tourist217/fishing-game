import { useState, useEffect } from 'react';
import type { FishingLocation } from '../locationsData';
import { ROD_TIERS, type PlayerGearState } from '../gearData';
import { AVAILABLE_BAITS } from '../hooks/useBaitState';
import { APP_VERSION } from '../version';
import type { FishJournal } from '../hooks/usePlayerState';
import { FishJournalModal } from './FishJournalModal';
import { RangerQuestsModal } from './RangerQuestsModal';
import type { DailyQuest } from '../types/quests';
import { getCurrentWeather, getWeatherForecast, TIME_CONFIGS, WEATHER_CONFIGS } from '../utils/weatherTime';
import { CoinIcon } from './CoinIcon';
import { EnergyIcon } from './EnergyIcon';

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
  gems?: number;
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
  onOpenKeepnet?: () => void;
  journal?: FishJournal;
  hasClaimedAllSpeciesReward?: boolean;
  onClaimAllSpeciesReward?: () => boolean;
  onResetProgress?: () => void;
  resetModalSignal?: number;
  dailyQuests?: DailyQuest[];
  allCompletedBonusClaimed?: boolean;
  timeUntilMidnight?: string;
  questCompletedCount?: number;
  questUnclaimedCount?: number;
  canClaimBonus?: boolean;
  onClaimQuestReward?: (questId: string) => boolean;
  onClaimDailyBonus?: () => boolean;
}

export const HomeScreen = ({
  currentLocation,
  gear,
  userName,
  level,
  exp,
  maxExp,
  coins,
  gems: _gems = 120,
  energy,
  maxEnergy,
  inventoryCount = 0,
  maxKeepnetCapacity = 15,
  selectedBaitId,
  baits,
  journal = {},
  hasClaimedAllSpeciesReward = false,
  onClaimAllSpeciesReward,
  onSelectBait,
  onEquipRod,
  onGoFishing,
  onOpenMap: _onOpenMap,
  onOpenShop,
  onOpenKeepnet,
  onResetProgress,
  resetModalSignal,
  dailyQuests = [],
  allCompletedBonusClaimed = false,
  timeUntilMidnight = '00:00:00',
  questCompletedCount = 0,
  questUnclaimedCount = 0,
  canClaimBonus = false,
  onClaimQuestReward,
  onClaimDailyBonus,
}: HomeScreenProps) => {
  const currentRod = ROD_TIERS.find((r) => r.id === gear.equippedRodId) || ROD_TIERS[0];
  const rodLevel = gear.rodLevels[gear.equippedRodId] || 1;
  const currentBait = AVAILABLE_BAITS.find((b) => b.id === selectedBaitId) || AVAILABLE_BAITS[0];
  const currentBaitCount = baits[selectedBaitId] || 0;
  const currentEnv = getCurrentWeather();
  const forecast = getWeatherForecast(4);

  // Интерактивные модальные окна
  const [activeModal, setActiveModal] = useState<
    'quests' | 'tournament' | 'weather' | 'settings' | 'baitSelect' | 'rodSelect' | 'leaderboard' | 'achievements' | 'journal' | null
  >(null);

  // Закрытие всех модальных окон при клике на "База" или смене таба в нижнем меню
  useEffect(() => {
    if (resetModalSignal !== undefined && resetModalSignal > 0) {
      setActiveModal(null);
    }
  }, [resetModalSignal]);

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
        justifyContent: 'flex-start',
        borderRadius: '0',
        overflow: 'hidden',
        border: 'none',
        boxShadow: 'none',
        userSelect: 'none',
        backgroundImage: 'url(/assets/locations/main_fishing_dock.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        paddingTop: 'max(96px, var(--tg-content-safe-area-inset-top, calc(env(safe-area-inset-top, 44px) + 52px)))',
        paddingLeft: 'max(10px, env(safe-area-inset-left, 10px))',
        paddingRight: 'max(10px, env(safe-area-inset-right, 10px))',
        paddingBottom: '8px',
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

      {/* 1. Верхнее меню в точности как на референсе */}
      <div
        style={{
          position: 'relative',
          zIndex: 15,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '10px',
        }}
      >
        {/* Карточка профиля игрока (слева) */}
        <div
          onClick={() => setActiveModal('settings')}
          title="Профиль и настройки"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(28, 36, 48, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '4px 12px 4px 5px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              border: '2px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)',
              flexShrink: 0,
            }}
          >
            🧔
          </div>
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: '0.2px',
              }}
            >
              {userName || 'Рыболов'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#38bdf8',
                }}
              >
                Ур. {level}
              </span>
              <div
                style={{
                  width: '52px',
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${expPercentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Правая группа: Монеты, Термос энергии, Шестерёнка */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Монеты */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(28, 36, 48, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '18px',
              padding: '6px 11px 6px 8px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
            }}
          >
            <CoinIcon size={19} />
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.2px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: 1,
              }}
            >
              {coins.toLocaleString('ru-RU')}
            </span>
          </div>

          {/* Фляга / Энергия */}
          <div
            title="Энергия рыбака"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(28, 36, 48, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '18px',
              padding: '5px 10px 5px 6px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
            }}
          >
            <EnergyIcon size={21} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '0.2px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: 1,
                }}
              >
                {energy}/{maxEnergy}
              </span>
              {/* Шкала энергии с золотым градиентным наполнением */}
              <div
                style={{
                  width: '38px',
                  height: '4px',
                  background: 'rgba(0, 0, 0, 0.55)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  border: '0.5px solid rgba(251, 191, 36, 0.25)',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, (energy / maxEnergy) * 100))}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #d97706, #fbbf24)',
                    boxShadow: '0 0 6px rgba(251, 191, 36, 0.6)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Кнопка настроек шестерёнка */}
          <button
            onClick={() => setActiveModal('settings')}
            title="Настройки"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '12px',
              background: 'rgba(28, 36, 48, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255, 255, 255, 0.12)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
              padding: 0,
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 2. Боковые блоки виджетов (Слева: Квесты, Карта, Достижения; Справа: Турниры, Погода, Лидерборд) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginTop: '6px',
        }}
      >
        {/* Левая колонка: Квесты, Карта, Достижения */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {/* 1. Квесты егеря */}
          <div
            onClick={() => setActiveModal('quests')}
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '20px',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
              transition: 'transform 0.12s ease',
              overflow: 'hidden',
              background: '#152232',
              border: '1.5px solid rgba(251, 191, 36, 0.4)',
            }}
          >
            <img
              src="/assets/icons/ranger_quests.png"
              alt="Заказы егеря"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Динамический бейдж при наличии готовых наград или прогресса > 0 */}
            {(questUnclaimedCount > 0 || canClaimBonus) ? (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 4px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(34, 197, 94, 0.95)',
                  border: '1.5px solid rgba(255, 255, 255, 0.7)',
                  zIndex: 2,
                }}
              >
                {canClaimBonus ? '🎁' : questUnclaimedCount}
              </span>
            ) : questCompletedCount > 0 ? (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  padding: '2px 5px',
                  borderRadius: '8px',
                  background: questCompletedCount === 3
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #b91c1c, #991b1b)',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.6)',
                  zIndex: 2,
                }}
              >
                {questCompletedCount}/3
              </span>
            ) : null}
          </div>

          {/* 2. Рыболовный журнал и энциклопедия */}
          {(() => {
            const caughtSpeciesCount = Object.keys(journal || {}).length;
            const isAllSpeciesCaught = caughtSpeciesCount >= 21;
            return (
              <div
                onClick={() => setActiveModal('journal')}
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
                  transition: 'transform 0.12s ease',
                  overflow: 'hidden',
                  background: '#152232',
                  border: '1.5px solid rgba(251, 191, 36, 0.4)',
                }}
              >
                <img
                  src="/assets/icons/journal.png"
                  alt="Журнал"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {/* Динамический бейдж при наличии открытых видов > 0 */}
                {caughtSpeciesCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      padding: '2px 5px',
                      borderRadius: '8px',
                      background: isAllSpeciesCaught
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      fontSize: '9px',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid rgba(255, 255, 255, 0.6)',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.6)',
                      zIndex: 2,
                    }}
                  >
                    {isAllSpeciesCaught ? '🏆 21/21' : `${caughtSpeciesCount}/21`}
                  </span>
                )}
              </div>
            );
          })()}
        </div>

        {/* Правая колонка: Турниры, Погода, Лидерборд */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {/* 1. Турниры */}
          <div
            onClick={() => setActiveModal('tournament')}
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '20px',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
              transition: 'transform 0.12s ease',
              overflow: 'hidden',
              background: '#152232',
              border: '1.5px solid rgba(251, 191, 36, 0.4)',
            }}
          >
            <img
              src="/assets/icons/tournaments.png"
              alt="Турниры"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          {/* 2. Погода */}
          <div
            onClick={() => setActiveModal('weather')}
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '20px',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
              transition: 'transform 0.12s ease',
              overflow: 'hidden',
              background: '#152232',
              border: '1.5px solid rgba(251, 191, 36, 0.4)',
            }}
          >
            <img
              src="/assets/icons/weather.png"
              alt="Погода"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Небольшой бейдж текущей погоды */}
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                padding: '2px 5px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#38bdf8',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.6)',
                zIndex: 2,
              }}
            >
              {WEATHER_CONFIGS[currentEnv.weather]?.icon || '🌤️'}
            </span>
          </div>

          {/* 3. Лидерборд */}
          <div
            onClick={() => setActiveModal('leaderboard')}
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '20px',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
              transition: 'transform 0.12s ease',
              overflow: 'hidden',
              background: '#152232',
              border: '1.5px solid rgba(251, 191, 36, 0.4)',
            }}
          >
            <img
              src="/assets/icons/leaderboard.png"
              alt="Лидерборд"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        </div>
      </div>

      {/* 2.5. Свободная центральная зона озера (открывает вид на водоём, водную гладь и мостик) */}
      <div style={{ flex: 1, minHeight: '30px' }} />

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

        {/* Кнопка «ЗАБРОСИТЬ» или «САДОК ПОЛОН» */}
        {(() => {
          const isKeepnetFull = inventoryCount >= maxKeepnetCapacity;
          return (
            <button
              onClick={isKeepnetFull ? (onOpenKeepnet || onGoFishing) : onGoFishing}
              style={{
                flex: 1,
                height: '62px',
                background: isKeepnetFull
                  ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 50%, #b45309 100%)'
                  : 'linear-gradient(180deg, #84cc16 0%, #65a30d 50%, #4d7c0f 100%)',
                border: isKeepnetFull ? '2.5px solid #fde047' : '2.5px solid #bef264',
                borderRadius: '31px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#ffffff',
                fontSize: isKeepnetFull ? '14px' : '18px',
                fontWeight: 900,
                letterSpacing: '0.8px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                boxShadow: isKeepnetFull
                  ? '0 0 28px rgba(245, 158, 11, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.6), 0 8px 24px rgba(0, 0, 0, 0.45)'
                  : '0 0 28px rgba(132, 204, 22, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.6), 0 8px 24px rgba(0, 0, 0, 0.45)',
                cursor: 'pointer',
                transition: 'transform 0.1s ease',
              }}
            >
              {isKeepnetFull ? (
                <>
                  <span style={{ fontSize: '24px' }}>🧺</span>
                  <span>САДОК ПОЛОН ({inventoryCount}/{maxKeepnetCapacity})</span>
                </>
              ) : (
                <>
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
                </>
              )}
            </button>
          );
        })()}

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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <img
                src="/assets/icons/leaderboard.png"
                alt="Лидерборд"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '1.5px solid rgba(251, 191, 36, 0.4)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
                }}
              />
            </div>
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

      {/* Рыболовный журнал и энциклопедия */}
      {activeModal === 'journal' && (
        <FishJournalModal
          journal={journal || {}}
          hasClaimedAllSpeciesReward={hasClaimedAllSpeciesReward || false}
          onClaimAllSpeciesReward={onClaimAllSpeciesReward || (() => false)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Заказы егеря */}
      {activeModal === 'quests' && (
        <RangerQuestsModal
          quests={dailyQuests || []}
          allCompletedBonusClaimed={allCompletedBonusClaimed || false}
          timeUntilMidnight={timeUntilMidnight || '00:00:00'}
          completedCount={questCompletedCount || 0}
          canClaimBonus={canClaimBonus || false}
          onClaimQuestReward={onClaimQuestReward || (() => false)}
          onClaimDailyBonus={onClaimDailyBonus || (() => false)}
          onClose={() => setActiveModal(null)}
        />
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <img
                src="/assets/icons/tournaments.png"
                alt="Турниры"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '1.5px solid rgba(251, 191, 36, 0.4)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
                }}
              />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fbbf24', marginBottom: '6px' }}>
              Ежедневный турнир
            </div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
              Турнир: <strong>«Золотой карась»</strong>.<br />
              Поймайте самого крупного карася за день.
              <br />
              Призовой фонд: <strong><CoinIcon size={16} /> 5,000 монет</strong>!
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
              maxWidth: '340px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <img
                src="/assets/icons/weather.png"
                alt="Погода"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '1.5px solid rgba(251, 191, 36, 0.4)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
                }}
              />
            </div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#bae6fd', marginBottom: '2px' }}>
              Сводка погоды и прогноз
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '14px' }}>
              Синхронизировано у всех рыбаков онлайн (период 15 мин)
            </div>

            {/* Карточка текущей погоды */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                borderRadius: '16px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '14px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{currentLocation.name}:</span>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>
                  {TIME_CONFIGS[currentEnv.timeOfDay]?.icon} {TIME_CONFIGS[currentEnv.timeOfDay]?.label}
                </span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{WEATHER_CONFIGS[currentEnv.weather]?.icon}</span>
                <span>{WEATHER_CONFIGS[currentEnv.weather]?.label}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
                {WEATHER_CONFIGS[currentEnv.weather]?.description}
              </div>
            </div>

            {/* Прогноз на следующие периоды */}
            <div style={{ textAlign: 'left', marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                ⏳ Прогноз смены погоды:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {forecast.map((slot, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '12px',
                      padding: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                      через ~{slot.startsInMinutes} мин
                    </div>
                    <div style={{ fontSize: '18px', margin: '2px 0' }}>
                      {TIME_CONFIGS[slot.timeOfDay]?.icon} {WEATHER_CONFIGS[slot.weather]?.icon}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0' }}>
                      {slot.timeLabel}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                      {WEATHER_CONFIGS[slot.weather]?.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4, margin: '0 0 14px 0' }}>
              💡 Активность рыбы зависит от времени и погоды. Подбирайте правильные снасти и наживки под условия!
            </p>

            <button
              onClick={() => setActiveModal(null)}
              style={{
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