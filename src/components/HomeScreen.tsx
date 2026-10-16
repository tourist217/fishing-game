import { useState } from 'react';
import type { FishingLocation } from '../locationsData';
import { ROD_TIERS, type PlayerGearState } from '../gearData';
import { AVAILABLE_BAITS } from '../hooks/useBaitState';
import { APP_VERSION } from '../version';

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
    'quests' | 'tournament' | 'weather' | 'settings' | 'baitSelect' | 'leaderboard' | 'achievements' | null
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
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '22px',
          padding: '8px 12px',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Аватар + Имя + Уровень + Опыт (крупные и легко читаемые) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              border: '2px solid #7dd3fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 2px 10px rgba(2, 132, 199, 0.55)',
              flexShrink: 0,
            }}
          >
            🧔
          </div>

          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.2,
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
                  background: 'rgba(56, 189, 248, 0.22)',
                  padding: '1px 6px',
                  borderRadius: '6px',
                }}
              >
                Ур. {level}
              </span>
              <div
                style={{
                  width: '65px',
                  height: '5px',
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

        {/* Ресурсы: Монеты, Термос энергии и Настройки (без дублирования садка, всё крупно) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Монеты */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(251, 191, 36, 0.15)',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              borderRadius: '14px',
              padding: '6px 10px',
              color: '#fbbf24',
              fontSize: '13px',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)',
            }}
          >
            <span style={{ fontSize: '15px' }}>🪙</span>
            <span>{coins.toLocaleString('ru-RU')}</span>
          </div>

          {/* Термос / Энергия */}
          <div
            title="Энергия рыбака"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(250, 204, 21, 0.14)',
              border: '1px solid rgba(250, 204, 21, 0.3)',
              borderRadius: '14px',
              padding: '6px 9px',
              color: '#fef08a',
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            <span style={{ fontSize: '14px' }}>⚡</span>
            <span>
              {energy}/{maxEnergy}
            </span>
          </div>

          {/* Кнопка настроек */}
          <button
            onClick={() => setActiveModal('settings')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 2. Центральная зона: Интерактивные карточки активностей прямо на водоёме */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          margin: 'auto 0',
        }}
      >
        {/* Главная плашка локации с возможностью быстрой смены карты */}
        <div
          onClick={onOpenMap}
          style={{
            background: 'rgba(15, 23, 42, 0.84)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '18px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>{currentLocation.icon}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                {currentLocation.name}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>
                Клёв: x{currentLocation.weightModifier} веса • Спокойная вода
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.5)',
            }}
          >
            <span>Карта</span>
            <span>🗺️</span>
          </div>
        </div>

        {/* Сетка активностей: Лидерборд, Достижения, Квесты, Турнир */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
          }}
        >
          {/* Лидерборд */}
          <button
            onClick={() => setActiveModal('leaderboard')}
            style={{
              background: 'rgba(15, 23, 42, 0.82)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(251, 191, 36, 0.28)',
              borderRadius: '16px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '26px' }}>🏆</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#fef08a' }}>
                Лидерборд
              </div>
              <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '1px' }}>
                Топ рыбаков недели
              </div>
            </div>
          </button>

          {/* Достижения */}
          <button
            onClick={() => setActiveModal('achievements')}
            style={{
              background: 'rgba(15, 23, 42, 0.82)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(168, 85, 247, 0.28)',
              borderRadius: '16px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '26px' }}>⭐</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#e9d5ff' }}>
                Достижения
              </div>
              <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '1px' }}>
                Трофеи и звания
              </div>
            </div>
          </button>

          {/* Квесты егеря */}
          <button
            onClick={() => setActiveModal('quests')}
            style={{
              background: 'rgba(15, 23, 42, 0.82)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(34, 197, 94, 0.28)',
              borderRadius: '16px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
              textAlign: 'left',
              position: 'relative',
            }}
          >
            {/* Точка уведомления */}
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: '#ef4444',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 900,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.8)',
              }}
            >
              !
            </span>
            <span style={{ fontSize: '26px' }}>🕵️‍♂️</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#bbf7d0' }}>
                Квесты егеря
              </div>
              <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '1px' }}>
                Задания пруда
              </div>
            </div>
          </button>

          {/* Ежедневный турнир */}
          <button
            onClick={() => setActiveModal('tournament')}
            style={{
              background: 'rgba(15, 23, 42, 0.82)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(245, 158, 11, 0.28)',
              borderRadius: '16px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '26px' }}>⏱️</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#fed7aa' }}>
                Турнир дня
              </div>
              <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '1px' }}>
                Осталось 14ч 32м
              </div>
            </div>
          </button>
        </div>

        {/* Строка погоды и прогноза клёва */}
        <div
          onClick={() => setActiveModal('weather')}
          style={{
            background: 'rgba(15, 23, 42, 0.76)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>🌤️</span>
            <span style={{ fontSize: '11px', color: '#bae6fd', fontWeight: 700 }}>
              Штиль • +21°C • Давление 750 мм
            </span>
          </div>
          <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: 800 }}>
            Клёв: Отличный
          </span>
        </div>
      </div>

      {/* 3. Нижний блок снастей (Action Dock прямо над мостиком) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '4px',
        }}
      >
        {/* Удилище (слева) */}
        <div
          onClick={onOpenShop}
          style={{
            flex: '0 0 auto',
            minWidth: '85px',
            maxWidth: '105px',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '18px',
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <span style={{ fontSize: '22px' }}>{currentRod.icon}</span>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>Удилище:</div>
            <div
              style={{
                fontSize: '11px',
                color: '#fff',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentRod.name.replace('удилище', '').replace('удочка', '').trim()} [{rodLevel} ур.]
            </div>
          </div>
        </div>

        {/* Кнопка «ЗАБРОСИТЬ» (по центру, крупная, сочная и светящаяся) */}
        <button
          onClick={onGoFishing}
          style={{
            flex: 1,
            height: '56px',
            background: 'linear-gradient(135deg, #a3e635 0%, #65a30d 45%, #3f6212 100%)',
            border: '2px solid #d9f99d',
            borderRadius: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 900,
            letterSpacing: '0.8px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            boxShadow:
              '0 0 28px rgba(163, 230, 53, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.6), 0 6px 20px rgba(0, 0, 0, 0.45)',
            cursor: 'pointer',
            transition: 'transform 0.1s ease',
          }}
        >
          <span
            style={{
              fontSize: '24px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
              display: 'inline-block',
              animation: 'bounce 2s infinite',
            }}
          >
            🪶
          </span>
          <span>ЗАБРОСИТЬ</span>
        </button>

        {/* Наживка (справа) */}
        <div
          onClick={() => setActiveModal('baitSelect')}
          style={{
            flex: '0 0 auto',
            minWidth: '85px',
            maxWidth: '105px',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '18px',
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <span style={{ fontSize: '22px' }}>{currentBait.icon}</span>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '11px',
                color: '#fff',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentBait.name}
            </div>
            <div
              style={{
                fontSize: '9px',
                color: currentBaitCount > 0 ? '#4ade80' : '#ef4444',
                fontWeight: 700,
              }}
            >
              {currentBaitCount} шт.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Интерактивные модальные окна */}
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