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
  inventoryCount,
  maxKeepnetCapacity,
  selectedBaitId,
  baits,
  onSelectBait,
  onGoFishing,
  onOpenMap,
  onOpenShop,
  onOpenInventory,
  onResetProgress,
}: HomeScreenProps) => {
  const currentRod = ROD_TIERS.find((r) => r.id === gear.equippedRodId) || ROD_TIERS[0];
  const rodLevel = gear.rodLevels[gear.equippedRodId] || 1;
  const currentBait = AVAILABLE_BAITS.find((b) => b.id === selectedBaitId) || AVAILABLE_BAITS[0];
  const currentBaitCount = baits[selectedBaitId] || 0;

  // Модальные окна для интерактивности
  const [activeModal, setActiveModal] = useState<
    'quests' | 'tournament' | 'weather' | 'settings' | 'baitSelect' | null
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
        padding: '12px 10px',
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

      {/* 1. Верхний компактный бар (Header), строго умещённый в ширину смартфона */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          padding: '6px 10px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
          gap: '6px',
        }}
      >
        {/* Аватар + уровень + опыт */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              border: '2px solid #7dd3fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.5)',
              flexShrink: 0,
            }}
          >
            🧔
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '90px',
                lineHeight: 1.2,
              }}
            >
              {userName || 'Рыболов'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.18)',
                  padding: '1px 5px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                Ур. {level}
              </span>
              <div
                style={{
                  width: '45px',
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
                    background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ресурсы: Монеты, Термос (Энергия), Садок и Настройки */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {/* Монеты */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              background: 'rgba(251, 191, 36, 0.12)',
              border: '1px solid rgba(251, 191, 36, 0.28)',
              borderRadius: '12px',
              padding: '4px 7px',
              color: '#fbbf24',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            <span>🪙</span>
            <span>{coins.toLocaleString('ru-RU')}</span>
          </div>

          {/* Термос / Энергия */}
          <div
            title="Энергия рыбака"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              background: 'rgba(250, 204, 21, 0.1)',
              border: '1px solid rgba(250, 204, 21, 0.25)',
              borderRadius: '12px',
              padding: '4px 6px',
              color: '#fef08a',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <span>⚡</span>
            <span>
              {energy}/{maxEnergy}
            </span>
          </div>

          {/* Садок */}
          <div
            onClick={onOpenInventory}
            title="Садок с уловом"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.28)',
              borderRadius: '12px',
              padding: '4px 6px',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span>🧺</span>
            <span>
              {inventoryCount}/{maxKeepnetCapacity}
            </span>
          </div>

          {/* Шестерёнка настроек */}
          <button
            onClick={() => setActiveModal('settings')}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
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

      {/* 2. Боковые виджеты (HUD) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          margin: '12px 2px 0 2px',
          pointerEvents: 'none',
        }}
      >
        {/* Слева: Квесты егеря */}
        <button
          onClick={() => setActiveModal('quests')}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '16px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)',
            position: 'relative',
          }}
        >
          {/* Красная точка-уведомление */}
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
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
          <span style={{ fontSize: '24px', lineHeight: 1 }}>🕵️‍♂️</span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#e2e8f0', lineHeight: 1 }}>
            Квесты егеря
          </span>
        </button>

        {/* По центру: Текущая локация с быстрым вызовом карты */}
        <button
          onClick={onOpenMap}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '14px',
            padding: '6px 12px',
            color: '#f8fafc',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
          }}
        >
          <span>📍</span>
          <span>{currentLocation.name}</span>
          <span style={{ fontSize: '10px', color: '#38bdf8' }}>🗺️</span>
        </button>

        {/* Справа: Турнир и Погода */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'flex-end',
          }}
        >
          {/* Ежедневный турнир */}
          <button
            onClick={() => setActiveModal('tournament')}
            style={{
              background: 'rgba(15, 23, 42, 0.82)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '16px',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)',
              position: 'relative',
              minWidth: '78px',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 800,
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
            <span style={{ fontSize: '22px', lineHeight: 1 }}>🏆</span>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#fef08a' }}>Турнир</span>
            <span style={{ fontSize: '8px', color: '#94a3b8', fontWeight: 600 }}>14ч 32м</span>
          </button>

          {/* Погода */}
          <button
            onClick={() => setActiveModal('weather')}
            style={{
              background: 'rgba(15, 23, 42, 0.82)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '14px',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            <span style={{ fontSize: '15px' }}>🌤️</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#bae6fd' }}>+21°C</span>
          </button>
        </div>
      </div>

      {/* 3. Центральная часть (простор над мостиком и гладью воды) */}
      <div style={{ flex: 1 }} />

      {/* 4. Нижний рыболовный блок (Action Dock) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '6px',
        }}
      >
        {/* Удилище (слева) */}
        <div
          onClick={onOpenShop}
          style={{
            flex: '0 0 auto',
            minWidth: '85px',
            maxWidth: '105px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
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

        {/* Кнопка «ЗАБРОСИТЬ» (по центру, крупная и сочная) */}
        <button
          onClick={onGoFishing}
          style={{
            flex: 1,
            height: '54px',
            background: 'linear-gradient(135deg, #a3e635 0%, #65a30d 45%, #3f6212 100%)',
            border: '2px solid #d9f99d',
            borderRadius: '27px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#fff',
            fontSize: '17px',
            fontWeight: 900,
            letterSpacing: '0.8px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            boxShadow:
              '0 0 26px rgba(163, 230, 53, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.6), 0 6px 20px rgba(0, 0, 0, 0.45)',
            cursor: 'pointer',
            transition: 'transform 0.1s ease',
          }}
        >
          <span
            style={{
              fontSize: '22px',
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
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
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

      {/* 5. Модальные окна */}
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