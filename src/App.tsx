import { useEffect, useState, useRef } from 'react';
import { getRandomFish, type Fish } from './fishData';

type GameState = 'idle' | 'waiting' | 'hooked' | 'reeling' | 'caught' | 'lost';

interface CaughtFishItem {
  fish: Fish;
  weight: number;
  price: number;
  exp: number;
}

export default function App() {
  const [userName, setUserName] = useState<string>('Рыбак');
  const [coins, setCoins] = useState<number>(0);
  const [exp, setExp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentFish, setCurrentFish] = useState<CaughtFishItem | null>(null);

  // Флаг защиты от случайного клика по экрану победы/поражения
  const [canDismissModal, setCanDismissModal] = useState<boolean>(false);

  // Состояния для вываживания
  const [tension, setTension] = useState<number>(50);
  const [catchProgress, setCatchProgress] = useState<number>(0);
  const isPullingRef = useRef<boolean>(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user?.first_name) {
        setUserName(tg.initDataUnsafe.user.first_name);
      }
    }
  }, []);

  const triggerHaptic = (type: 'impact' | 'notification' | 'selection') => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      if (type === 'impact') tg.HapticFeedback.impactOccurred('medium');
      if (type === 'notification') tg.HapticFeedback.notificationOccurred('success');
      if (type === 'selection') tg.HapticFeedback.selectionChanged();
    }
  };

  const startFishing = () => {
    setGameState('waiting');
    triggerHaptic('selection');

    const waitTime = Math.random() * 2500 + 2000;
    setTimeout(() => {
      const target = getRandomFish();
      setCurrentFish(target);
      setGameState('hooked');
      triggerHaptic('notification');
    }, waitTime);
  };

  const startReeling = () => {
    setGameState('reeling');
    setTension(50);
    setCatchProgress(15);
    triggerHaptic('impact');
  };

  useEffect(() => {
    if (gameState !== 'reeling') return;

    let localTension = tension;
    let localProgress = catchProgress;

    const interval = setInterval(() => {
      if (isPullingRef.current) {
        localTension += 2.4;
      } else {
        localTension -= 1.8;
      }

      if (Math.random() < 0.1) {
        localTension += (Math.random() - 0.5) * 12;
      }

      const inSweetSpot = localTension >= 35 && localTension <= 70;

      if (inSweetSpot) {
        localProgress += 1.0;
      } else {
        localProgress -= 0.6;
      }

      // Рыба сорвалась
      if (localTension >= 100 || localTension <= 0 || localProgress <= 0) {
        clearInterval(interval);
        setGameState('lost');
        setCanDismissModal(false);
        // Защитная задержка 1.2 сек перед показом активной кнопки
        setTimeout(() => setCanDismissModal(true), 1200);

        const tg = (window as any).Telegram?.WebApp;
        tg?.HapticFeedback?.notificationOccurred('error');
        return;
      }

      // Рыба выловлена
      if (localProgress >= 100) {
        clearInterval(interval);
        if (currentFish) {
          setCoins((prev) => prev + currentFish.price);
          setExp((prev) => {
            const nextExp = prev + currentFish.exp;
            if (nextExp >= level * 100) {
              setLevel((lvl) => lvl + 1);
            }
            return nextExp;
          });
        }
        setGameState('caught');
        setCanDismissModal(false);
        // Защитная задержка 1.5 сек перед показом активной кнопки
        setTimeout(() => setCanDismissModal(true), 1500);

        triggerHaptic('notification');
        return;
      }

      setTension(Math.max(0, Math.min(100, localTension)));
      setCatchProgress(Math.max(0, Math.min(100, localProgress)));
    }, 40);

    return () => clearInterval(interval);
  }, [gameState, currentFish, level]);

  // Названия редкости
  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return { text: 'ЛЕГЕНДАРНАЯ', color: '#fbbf24' };
      case 'epic': return { text: 'ЭПИЧЕСКАЯ', color: '#c084fc' };
      case 'rare': return { text: 'РЕДКАЯ', color: '#60a5fa' };
      default: return { text: 'ОБЫЧНАЯ', color: '#94a3b8' };
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px',
        justifyContent: 'space-between',
        background: 'linear-gradient(180deg, #091325 0%, #0d2744 60%, #06192d 100%)',
        userSelect: 'none',
      }}
    >
      {/* Верхняя плашка профиля */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '12px 16px',
        }}
      >
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{userName}</div>
          <div style={{ fontSize: '12px', color: '#38bdf8' }}>Уровень {level}</div>
        </div>
        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fbbf24' }}>
            🪙 {coins}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a78bfa' }}>
            ⭐ {exp}
          </div>
        </div>
      </div>

      {/* Центральная игровая зона */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        {gameState === 'idle' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>🌊</div>
            <p style={{ color: '#94a3b8' }}>Тихая гладь воды... Пора забросить удочку!</p>
          </div>
        )}

        {gameState === 'waiting' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>📍</div>
            <p style={{ color: '#38bdf8', fontWeight: 'bold' }}>Ждем поклевку...</p>
          </div>
        )}

        {gameState === 'hooked' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>💥</div>
            <h2 style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold' }}>
              КЛЮЕТ! ПОДСЕКАЙ!
            </h2>
          </div>
        )}

        {gameState === 'reeling' && (
          <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Вываживание</span>
                <span>{Math.round(catchProgress)}%</span>
              </div>
              <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '7px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${catchProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8, #22c55e)',
                    transition: 'width 0.1s ease',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Натяжение лески</span>
                <span style={{ color: tension > 70 || tension < 35 ? '#ef4444' : '#22c55e' }}>
                  {tension > 70 ? 'Слишком сильно!' : tension < 35 ? 'Слишком слабо!' : 'Идеально'}
                </span>
              </div>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '24px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '35%',
                    width: '35%',
                    height: '100%',
                    background: 'rgba(34, 197, 94, 0.35)',
                    borderLeft: '2px dashed #22c55e',
                    borderRight: '2px dashed #22c55e',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: `${tension}%`,
                    top: '2px',
                    width: '12px',
                    height: '20px',
                    marginLeft: '-6px',
                    background: '#ffffff',
                    borderRadius: '4px',
                    boxShadow: '0 0 8px #ffffff',
                    transition: 'left 0.05s ease',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {gameState === 'caught' && currentFish && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '24px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.15)',
              width: '100%',
              maxWidth: '300px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Плашка редкости */}
            <div
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                color: getRarityLabel(currentFish.fish.rarity).color,
                background: 'rgba(255,255,255,0.06)',
                marginBottom: '12px',
              }}
            >
              {getRarityLabel(currentFish.fish.rarity).text}
            </div>

            <div style={{ fontSize: '64px', marginBottom: '8px' }}>{currentFish.fish.icon}</div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold' }}>{currentFish.fish.name}</h3>
            <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '4px', marginBottom: '16px' }}>
              Вес: <strong style={{ color: '#ffffff' }}>{currentFish.weight} кг</strong>
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '12px',
                padding: '10px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Награда</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fbbf24' }}>
                  +{currentFish.price} 🪙
                </div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Опыт</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#a78bfa' }}>
                  +{currentFish.exp} ⭐
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === 'lost' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>💨</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>Рыба сорвалась!</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
              Леска ослабла или оборвалась от сильного натяжения.
            </p>
          </div>
        )}
      </div>

      {/* Нижняя кнопка управления */}
      <div>
        {gameState === 'idle' && (
          <button
            onClick={startFishing}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Забросить удочку 🎣
          </button>
        )}

        {gameState === 'hooked' && (
          <button
            onClick={startReeling}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ПОДСЕЧЬ! ⚡
          </button>
        )}

        {gameState === 'reeling' && (
          <button
            onMouseDown={() => { isPullingRef.current = true; }}
            onMouseUp={() => { isPullingRef.current = false; }}
            onTouchStart={() => { isPullingRef.current = true; }}
            onTouchEnd={() => { isPullingRef.current = false; }}
            style={{
              width: '100%',
              padding: '20px',
              borderRadius: '16px',
              border: 'none',
              background: '#059669',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ТЯНУТЬ КАТУШКУ 🌀
          </button>
        )}

        {(gameState === 'caught' || gameState === 'lost') && (
          <button
            disabled={!canDismissModal}
            onClick={() => {
              if (canDismissModal) setGameState('idle');
            }}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: canDismissModal ? '#38bdf8' : '#334155',
              color: canDismissModal ? '#0f172a' : '#64748b',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: canDismissModal ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            {canDismissModal ? 'Забрать улов 🎣' : 'Осматриваем рыбу...'}
          </button>
        )}
      </div>
    </div>
  );
}