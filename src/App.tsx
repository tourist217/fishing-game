import { useEffect, useState, useRef } from 'react';
import { getRandomFish, type Fish } from './fishData';

type GameState = 'idle' | 'waiting' | 'hooked' | 'reeling' | 'caught' | 'lost';
type ActiveTab = 'fishing' | 'inventory';

export interface CaughtFishItem {
  uid: string; // уникальный id для списка
  fish: Fish;
  weight: number;
  price: number;
  exp: number;
  caughtAt: number;
}

export default function App() {
  const [userName, setUserName] = useState<string>('Рыбак');
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('fg_coins');
    return saved ? Number(saved) : 0;
  });
  const [exp, setExp] = useState<number>(() => {
    const saved = localStorage.getItem('fg_exp');
    return saved ? Number(saved) : 0;
  });
  const [level, setLevel] = useState<number>(() => {
    const saved = localStorage.getItem('fg_level');
    return saved ? Number(saved) : 1;
  });
  const [inventory, setInventory] = useState<CaughtFishItem[]>(() => {
    const saved = localStorage.getItem('fg_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('fishing');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentFish, setCurrentFish] = useState<CaughtFishItem | null>(null);
  const [canDismissModal, setCanDismissModal] = useState<boolean>(false);

  // Состояния для вываживания
  const [tension, setTension] = useState<number>(50);
  const [catchProgress, setCatchProgress] = useState<number>(0);
  const isPullingRef = useRef<boolean>(false);

  // Сохранение в память браузера (localStorage)
  useEffect(() => {
    localStorage.setItem('fg_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('fg_exp', exp.toString());
  }, [exp]);

  useEffect(() => {
    localStorage.setItem('fg_level', level.toString());
  }, [level]);

  useEffect(() => {
    localStorage.setItem('fg_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Подключение к Telegram
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
      const generated = getRandomFish();
      const fishItem: CaughtFishItem = {
        ...generated,
        uid: Math.random().toString(36).substring(2, 9),
        caughtAt: Date.now(),
      };
      setCurrentFish(fishItem);
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

      if (localTension >= 100 || localTension <= 0 || localProgress <= 0) {
        clearInterval(interval);
        setGameState('lost');
        setCanDismissModal(false);
        setTimeout(() => setCanDismissModal(true), 1200);

        const tg = (window as any).Telegram?.WebApp;
        tg?.HapticFeedback?.notificationOccurred('error');
        return;
      }

      if (localProgress >= 100) {
        clearInterval(interval);
        if (currentFish) {
          // Добавляем рыбу в садок (инвентарь)
          setInventory((prev) => [currentFish, ...prev]);
          // Опыт даем сразу за поимку
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
        setTimeout(() => setCanDismissModal(true), 1500);

        triggerHaptic('notification');
        return;
      }

      setTension(Math.max(0, Math.min(100, localTension)));
      setCatchProgress(Math.max(0, Math.min(100, localProgress)));
    }, 40);

    return () => clearInterval(interval);
  }, [gameState, currentFish, level]);

  // Продажа конкретной рыбы
  const sellFish = (uid: string, price: number) => {
    setCoins((prev) => prev + price);
    setInventory((prev) => prev.filter((item) => item.uid !== uid));
    triggerHaptic('impact');
  };

  // Продажа всего улова
  const sellAllFish = () => {
    if (inventory.length === 0) return;
    const total = inventory.reduce((sum, item) => sum + item.price, 0);
    setCoins((prev) => prev + total);
    setInventory([]);
    triggerHaptic('notification');
  };

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
        padding: '16px 16px 8px 16px',
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

      {/* Контент активной вкладки */}
      {activeTab === 'fishing' ? (
        /* Вкладка Рыбалки */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            margin: '16px 0',
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
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Стоимость</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fbbf24' }}>
                    {currentFish.price} 🪙
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
      ) : (
        /* Вкладка Садок (Инвентарь) */
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            margin: '16px 0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Садок ({inventory.length} шт.)
            </h2>
            {inventory.length > 0 && (
              <button
                onClick={sellAllFish}
                style={{
                  background: '#10b981',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Продать всё (+{inventory.reduce((sum, item) => sum + item.price, 0)} 🪙)
              </button>
            )}
          </div>

          {inventory.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🧺</div>
              <div>Садок пуст. Время на рыбалку!</div>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
              {inventory.map((item) => (
                <div
                  key={item.uid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '14px',
                    padding: '10px 14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '32px' }}>{item.fish.icon}</div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{item.fish.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {item.weight} кг • <span style={{ color: getRarityLabel(item.fish.rarity).color }}>{getRarityLabel(item.fish.rarity).text}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => sellFish(item.uid, item.price)}
                    style={{
                      background: 'rgba(251, 191, 36, 0.15)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      color: '#fbbf24',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    +{item.price} 🪙
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Кнопки действий (только во вкладке рыбалки) */}
      {activeTab === 'fishing' && (
        <div style={{ marginBottom: '10px' }}>
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
              {canDismissModal ? 'Положить в садок 🧺' : 'Осматриваем рыбу...'}
            </button>
          )}
        </div>
      )}

      {/* Нижняя панель навигации (Вкладки) */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          padding: '4px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <button
          onClick={() => setActiveTab('fishing')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '12px',
            background: activeTab === 'fishing' ? '#2563eb' : 'transparent',
            color: activeTab === 'fishing' ? '#ffffff' : '#94a3b8',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Рыбалка 🎣
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '12px',
            background: activeTab === 'inventory' ? '#2563eb' : 'transparent',
            color: activeTab === 'inventory' ? '#ffffff' : '#94a3b8',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          Садок 🧺 {inventory.length > 0 && `(${inventory.length})`}
        </button>
      </div>
    </div>
  );
}