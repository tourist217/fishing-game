import React, { useState } from 'react';
import { FISH_DATABASE, type Fish, type FishRarity } from '../fishData';
import { LOCATIONS } from '../locationsData';
import { formatWeight } from '../utils/fishUtils';
import type { FishJournal } from '../hooks/usePlayerState';
import { triggerHaptic } from '../utils/haptics';
import { AVAILABLE_BAITS } from '../hooks/useBaitState';
import { TIME_CONFIGS, WEATHER_CONFIGS, type TimeOfDay, type WeatherType } from '../utils/weatherTime';
import { CoinIcon } from './CoinIcon';

interface FishJournalModalProps {
  journal: FishJournal;
  hasClaimedAllSpeciesReward: boolean;
  onClaimAllSpeciesReward: () => boolean;
  onClose: () => void;
}

type TabType = 'species' | 'trophies' | 'medals';

export const FishJournalModal: React.FC<FishJournalModalProps> = ({
  journal,
  hasClaimedAllSpeciesReward,
  onClaimAllSpeciesReward,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('species');
  const [rarityFilter, setRarityFilter] = useState<FishRarity | 'all'>('all');
  const [inspectedFish, setInspectedFish] = useState<Fish | null>(null);

  const totalSpecies = FISH_DATABASE.length;
  const caughtSpeciesCount = Object.keys(journal).length;
  const trophyCount = Object.values(journal).filter((j) => j.hasTrophy).length;
  const progressPercent = Math.min(100, Math.round((caughtSpeciesCount / totalSpecies) * 100));
  const isAllCaught = caughtSpeciesCount >= totalSpecies;

  const filteredFishes = FISH_DATABASE.filter((fish) => {
    if (rarityFilter === 'all') return true;
    return fish.rarity === rarityFilter;
  });

  const getRarityBadge = (rarity: FishRarity) => {
    switch (rarity) {
      case 'legendary':
        return { label: 'Легендарная', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' };
      case 'epic':
        return { label: 'Эпическая', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' };
      case 'rare':
        return { label: 'Редкая', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
      case 'common':
      default:
        return { label: 'Обычная', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' };
    }
  };

  const getActivityBadge = (coeff: number = 1.0) => {
    if (coeff >= 1.3) return { label: 'Жор', color: '#f87171', bg: 'rgba(239, 68, 68, 0.18)', icon: '🔥' };
    if (coeff >= 1.0) return { label: 'Активна', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.18)', icon: '✨' };
    if (coeff >= 0.5) return { label: 'Слабо', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', icon: '🌤️' };
    return { label: 'Спит', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', icon: '💤' };
  };

  const getBaitBadge = (pref: number = 0) => {
    if (pref >= 0.9) return { label: 'Любимая', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.18)', icon: '🟢' };
    if (pref >= 0.5) return { label: 'Клюёт', color: '#facc15', bg: 'rgba(250, 204, 21, 0.18)', icon: '🟡' };
    if (pref > 0) return { label: 'Редко', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.14)', icon: '⚪' };
    return { label: 'Игнор', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: '❌' };
  };

  const handleClaimReward = () => {
    if (onClaimAllSpeciesReward()) {
      triggerHaptic('success');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        background: 'rgba(5, 10, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'max(84px, var(--tg-content-safe-area-inset-top, calc(env(safe-area-inset-top, 44px) + 40px))) 12px calc(12px + env(safe-area-inset-bottom, 0px)) 12px',
        userSelect: 'none',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '360px',
          height: '100%',
          maxHeight: '100%',
          background: 'linear-gradient(180deg, #16202c 0%, #0f172a 100%)',
          borderRadius: '26px',
          border: '1.5px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Шапка журнала */}
        <div
          style={{
            padding: '14px 16px 10px 16px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px' }}>📖</span>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                  Рыболовный журнал
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Энциклопедия рыб и галерея трофеев
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#cbd5e1',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Прогресс-бар коллекции всех видов */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#e2e8f0' }}>
                Коллекция видов
              </span>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#38bdf8' }}>
                {caughtSpeciesCount} / {totalSpecies} ({progressPercent}%)
              </span>
            </div>

            <div
              style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #38bdf8 0%, #22c55e 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            {/* Награда за сбор всех видов */}
            {isAllCaught && (
              <div style={{ marginTop: '2px' }}>
                {!hasClaimedAllSpeciesReward ? (
                  <button
                    onClick={handleClaimReward}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '10px',
                      border: '1.5px solid #fef08a',
                      background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
                      color: '#1c1917',
                      fontSize: '11px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 0 14px rgba(250, 204, 21, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>🏆</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      Забрать награду: +5 000 <CoinIcon size={14} /> и +100 💎
                    </span>
                  </button>
                ) : (
                  <div style={{ fontSize: '10px', color: '#4ade80', fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                    ✅ Главная награда ихтиолога получена (+5 000 <CoinIcon size={12} />, +100 💎)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Вкладки: Виды / Трофеи / Медали */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '12px',
              padding: '3px',
              gap: '4px',
            }}
          >
            {[
              { id: 'species' as TabType, label: '🐟 Виды', badge: `${caughtSpeciesCount}/${totalSpecies}` },
              { id: 'trophies' as TabType, label: '🏆 Трофеи', badge: trophyCount > 0 ? trophyCount : undefined },
              { id: 'medals' as TabType, label: '🎖️ Медали' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    triggerHaptic('selection');
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    borderRadius: '9px',
                    border: 'none',
                    background: isActive ? '#38bdf8' : 'transparent',
                    color: isActive ? '#0f172a' : '#94a3b8',
                    fontWeight: 900,
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      style={{
                        fontSize: '9px',
                        background: isActive ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                        padding: '1px 4px',
                        borderRadius: '6px',
                        color: isActive ? '#0f172a' : '#cbd5e1',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ВКЛАДКА 1: ЭНЦИКЛОПЕДИЯ ВСЕХ ВИДОВ */}
        {activeTab === 'species' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Фильтр редкости */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                padding: '8px 14px',
                overflowX: 'auto',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {[
                { id: 'all', label: 'Все' },
                { id: 'common', label: 'Обычные' },
                { id: 'rare', label: 'Редкие' },
                { id: 'epic', label: 'Эпические' },
                { id: 'legendary', label: 'Легендарные' },
              ].map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setRarityFilter(rf.id as any)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '8px',
                    border: rarityFilter === rf.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: rarityFilter === rf.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                    color: rarityFilter === rf.id ? '#38bdf8' : '#94a3b8',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {rf.label}
                </button>
              ))}
            </div>

            {/* Сетка карточек рыб */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '10px 12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                alignContent: 'start',
              }}
            >
              {filteredFishes.map((fish) => {
                const entry = journal[fish.id];
                const isDiscovered = Boolean(entry);
                const rarity = getRarityBadge(fish.rarity);

                return (
                  <div
                    key={fish.id}
                    onClick={() => {
                      setInspectedFish(fish);
                      triggerHaptic('selection');
                    }}
                    style={{
                      background: isDiscovered
                        ? 'rgba(30, 41, 59, 0.7)'
                        : 'rgba(15, 23, 42, 0.5)',
                      borderRadius: '16px',
                      padding: '10px',
                      border: isDiscovered
                        ? entry.hasTrophy
                          ? '1.5px solid #fde047'
                          : `1px solid ${rarity.color}35`
                        : '1px dashed rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: entry?.hasTrophy
                        ? '0 0 14px rgba(250, 204, 21, 0.25)'
                        : 'none',
                    }}
                  >
                    {/* Бейдж трофея если пойман */}
                    {entry?.hasTrophy && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          fontSize: '12px',
                          filter: 'drop-shadow(0 0 4px #fde047)',
                        }}
                      >
                        🏆
                      </span>
                    )}

                    {/* Картинка / силуэт */}
                    <div
                      style={{
                        width: '74px',
                        height: '52px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '6px',
                      }}
                    >
                      {isDiscovered ? (
                        fish.image ? (
                          <img
                            src={fish.image}
                            alt={fish.name}
                            style={{
                              maxWidth: '70px',
                              maxHeight: '48px',
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '32px' }}>{fish.icon}</span>
                        )
                      ) : (
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            color: '#64748b',
                          }}
                        >
                          ❓
                        </div>
                      )}
                    </div>

                    {/* Название */}
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: isDiscovered ? '#ffffff' : '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%',
                      }}
                    >
                      {isDiscovered ? fish.name : 'Неизвестная рыба'}
                    </div>

                    {/* Статистика вылова */}
                    {isDiscovered ? (
                      <div style={{ marginTop: '4px', fontSize: '9.5px', color: '#94a3b8' }}>
                        <div>
                          Рекорд: <span style={{ color: '#38bdf8', fontWeight: 800 }}>{formatWeight(entry.maxWeight)}</span>
                        </div>
                        <div style={{ color: '#64748b', marginTop: '1px' }}>
                          Выловлено: {entry.count} шт.
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: '4px', fontSize: '9px', color: '#475569' }}>
                        Ещё не поймана
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ВКЛАДКА 2: КНИГА ТРОФЕЕВ */}
        {activeTab === 'trophies' && (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {trophyCount === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px 16px',
                  textAlign: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '52px' }}>🏆</span>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff' }}>
                  В книге трофеев пока пусто
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.4, maxWidth: '240px' }}>
                  Ловите рыбу на глубоководных водоёмах, используйте редкие наживки и прокачивайте снасти, чтобы добыть легендарный трофей!
                </div>
              </div>
            ) : (
              Object.values(journal)
                .filter((j) => j.hasTrophy)
                .map((entry) => {
                  const fish = FISH_DATABASE.find((f) => f.id === entry.fishId);
                  if (!fish) return null;

                  return (
                    <div
                      key={entry.fishId}
                      onClick={() => {
                        setInspectedFish(fish);
                        triggerHaptic('selection');
                      }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(20, 27, 40, 0.95) 100%)',
                        border: '1.5px solid #fde047',
                        borderRadius: '18px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 20px rgba(250, 204, 21, 0.2)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '14px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1.5px solid rgba(250, 204, 21, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {fish.image ? (
                            <img src={fish.image} alt={fish.name} style={{ width: '46px', height: '36px', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontSize: '28px' }}>{fish.icon}</span>
                          )}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 900, color: '#ffffff' }}>
                              {fish.name}
                            </span>
                            <span style={{ fontSize: '11px' }}>👑</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            Рекордный вес:{' '}
                            <span style={{ color: '#fde047', fontWeight: 900, fontSize: '12px' }}>
                              {formatWeight(entry.trophyWeight || entry.maxWeight)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          background: 'rgba(250, 204, 21, 0.15)',
                          border: '1px solid rgba(250, 204, 21, 0.4)',
                          borderRadius: '10px',
                          padding: '4px 8px',
                          color: '#fde047',
                          fontSize: '10px',
                          fontWeight: 900,
                        }}
                      >
                        ТРОФЕЙ
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* ВКЛАДКА 3: МЕДАЛИ И НАГРАДЫ */}
        {activeTab === 'medals' && (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {[
              {
                icon: '🥉',
                title: 'Первый заброс',
                desc: 'Поймать первую рыбу в игре',
                progress: Math.min(1, caughtSpeciesCount),
                total: 1,
                reward: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>+50 <CoinIcon size={12} /></span>,
              },
              {
                icon: '🥈',
                title: 'Рыбацкий азарт',
                desc: 'Поймать 5 разных видов рыб',
                progress: Math.min(5, caughtSpeciesCount),
                total: 5,
                reward: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>+250 <CoinIcon size={12} />, +10 💎</span>,
              },
              {
                icon: '🥇',
                title: 'Опытный натуралист',
                desc: 'Открыть 12 видов рыб в журнале',
                progress: Math.min(12, caughtSpeciesCount),
                total: 12,
                reward: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>+1 000 <CoinIcon size={12} />, +30 💎</span>,
              },
              {
                icon: '👑',
                title: 'Гроза трофеев',
                desc: 'Выловить 3 трофейных экземпляра',
                progress: Math.min(3, trophyCount),
                total: 3,
                reward: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>+2 000 <CoinIcon size={12} />, +50 💎</span>,
              },
              {
                icon: '🌟',
                title: 'Хозяин всех рек',
                desc: 'Собрать полную коллекцию (все 21 вид)',
                progress: caughtSpeciesCount,
                total: totalSpecies,
                reward: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>+5 000 <CoinIcon size={12} />, +100 💎</span>,
              },
            ].map((medal, i) => {
              const isCompleted = medal.progress >= medal.total;
              return (
                <div
                  key={i}
                  style={{
                    background: isCompleted ? 'rgba(34, 197, 94, 0.12)' : 'rgba(30, 41, 59, 0.7)',
                    border: isCompleted ? '1.5px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '28px' }}>{medal.icon}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                        {medal.title}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '1px' }}>
                        {medal.desc}
                      </div>
                      <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 800, marginTop: '2px' }}>
                        Прогресс: {medal.progress} / {medal.total}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#fbbf24' }}>
                      {medal.reward}
                    </div>
                    {isCompleted && (
                      <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: 900 }}>
                        ✓ Выполнено
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Кнопка быстрого возврата на базу */}
        <div
          style={{
            padding: '8px 14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
              color: '#94a3b8',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>🏠</span>
            <span>Вернуться на базу</span>
          </button>
        </div>

        {/* Всплывающее подробное досье выбранной рыбы (Бестиарий) */}
        {inspectedFish && (() => {
          const entry = journal[inspectedFish.id];
          const isDiscovered = Boolean(entry);
          const rarity = getRarityBadge(inspectedFish.rarity);
          const times: TimeOfDay[] = ['morning', 'day', 'evening', 'night'];
          const weathers: WeatherType[] = ['clear', 'fog', 'overcast', 'rain'];

          return (
            <div
              onClick={() => setInspectedFish(null)}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 60,
                background: 'rgba(5, 10, 18, 0.88)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '350px',
                  maxHeight: '92%',
                  background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                  borderRadius: '24px',
                  border: isDiscovered && entry?.hasTrophy
                    ? '1.5px solid #facc15'
                    : `1.5px solid ${rarity.color}60`,
                  padding: '16px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: entry?.hasTrophy
                    ? '0 0 25px rgba(250, 204, 21, 0.3), 0 16px 40px rgba(0, 0, 0, 0.8)'
                    : '0 16px 40px rgba(0, 0, 0, 0.8)',
                  overflowY: 'auto',
                }}
              >
                {/* 1. Шапка карточки досье */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '18px' }}>📖</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Бестиарий видов
                    </span>
                  </div>
                  <button
                    onClick={() => setInspectedFish(null)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: '#cbd5e1',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* 2. Визуальная карточка рыбы */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    borderRadius: '18px',
                    padding: '14px 12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Трофейная ленточка если выловлен трофей */}
                  {isDiscovered && entry?.hasTrophy && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
                        color: '#1c1917',
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontSize: '9.5px',
                        fontWeight: 900,
                        boxShadow: '0 0 10px rgba(250, 204, 21, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>🏆</span>
                      <span>ТРОФЕЙ</span>
                    </div>
                  )}

                  {/* Изображение рыбы */}
                  <div
                    style={{
                      width: '130px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {isDiscovered ? (
                      inspectedFish.image ? (
                        <img
                          src={inspectedFish.image}
                          alt={inspectedFish.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.5))',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '56px' }}>{inspectedFish.icon}</span>
                      )
                    ) : (
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {inspectedFish.image ? (
                          <img
                            src={inspectedFish.image}
                            alt="Неизвестный вид"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                              filter: 'brightness(0) invert(0.25)',
                              opacity: 0.7,
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '56px', filter: 'brightness(0) invert(0.25)', opacity: 0.7 }}>
                            {inspectedFish.icon}
                          </span>
                        )}
                        <span
                          style={{
                            position: 'absolute',
                            fontSize: '28px',
                            color: '#38bdf8',
                            filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))',
                          }}
                        >
                          ❓
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
                    {isDiscovered ? inspectedFish.name : '??? (Неизвестный вид)'}
                  </div>

                  <div
                    style={{
                      marginTop: '4px',
                      background: rarity.bg,
                      color: rarity.color,
                      border: `1px solid ${rarity.color}40`,
                      borderRadius: '8px',
                      padding: '2px 8px',
                      fontSize: '10.5px',
                      fontWeight: 800,
                    }}
                  >
                    {rarity.label}
                  </div>
                </div>

                {/* 3. Личная статистика игрока */}
                {isDiscovered ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '14px', padding: '8px 4px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>Личный рекорд</div>
                      <div style={{ fontSize: '13px', fontWeight: 900, color: '#facc15', marginTop: '2px' }}>
                        {formatWeight(entry.maxWeight)}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '14px', padding: '8px 4px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>Выловлено</div>
                      <div style={{ fontSize: '13px', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
                        {entry.count} шт.
                      </div>
                    </div>
                    <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '14px', padding: '8px 4px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>Ценность</div>
                      <div style={{ fontSize: '13px', fontWeight: 900, color: '#4ade80', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                        {inspectedFish.basePricePerKg} <CoinIcon size={13} />/кг
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.5)',
                      borderRadius: '14px',
                      padding: '10px 12px',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                      textAlign: 'center',
                      fontSize: '11px',
                      color: '#94a3b8',
                    }}
                  >
                    🔒 Экземпляр ещё не выловлен. Записи рекордов откроются после первой поимки!
                  </div>
                )}

                {/* 4. Описание и повадки */}
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '16px',
                    padding: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🌿</span>
                    <span>Повадки и особенности:</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {isDiscovered
                      ? (inspectedFish.description || 'Обитатель рек и озёр средней полосы.')
                      : 'Этот вид ещё не изучен. Отправляйтесь на водоёмы, экспериментируйте с наживками и временем суток, чтобы внести подробные повадки в бестиарий!'}
                  </div>
                </div>

                {/* 5. Суточный ритм (Время суток) */}
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '16px',
                    padding: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#facc15', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>⏰</span>
                    <span>Суточный ритм клёва:</span>
                  </div>
                  {isDiscovered ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {times.map((t) => {
                        const coeff = inspectedFish.timePreferences?.[t] ?? 1.0;
                        const badge = getActivityBadge(coeff);
                        return (
                          <div
                            key={t}
                            style={{
                              background: badge.bg,
                              border: `1px solid ${badge.color}35`,
                              borderRadius: '10px',
                              padding: '6px 2px',
                              textAlign: 'center',
                            }}
                          >
                            <div style={{ fontSize: '14px' }}>{TIME_CONFIGS[t]?.icon}</div>
                            <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#e2e8f0', margin: '2px 0' }}>
                              {TIME_CONFIGS[t]?.label}
                            </div>
                            <div style={{ fontSize: '9px', fontWeight: 900, color: badge.color }}>
                              {badge.icon} {badge.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '10.5px', color: '#64748b', textAlign: 'center', padding: '6px 0' }}>
                      🔒 Изучите вид, поймав первую рыбу
                    </div>
                  )}
                </div>

                {/* 6. Зависимость от погоды */}
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '16px',
                    padding: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🌦️</span>
                    <span>Зависимость от погоды:</span>
                  </div>
                  {isDiscovered ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {weathers.map((w) => {
                        const coeff = inspectedFish.weatherPreferences?.[w] ?? 1.0;
                        const badge = getActivityBadge(coeff);
                        return (
                          <div
                            key={w}
                            style={{
                              background: badge.bg,
                              border: `1px solid ${badge.color}35`,
                              borderRadius: '10px',
                              padding: '6px 2px',
                              textAlign: 'center',
                            }}
                          >
                            <div style={{ fontSize: '14px' }}>{WEATHER_CONFIGS[w]?.icon}</div>
                            <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#e2e8f0', margin: '2px 0' }}>
                              {WEATHER_CONFIGS[w]?.label}
                            </div>
                            <div style={{ fontSize: '9px', fontWeight: 900, color: badge.color }}>
                              {badge.icon} {badge.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '10.5px', color: '#64748b', textAlign: 'center', padding: '6px 0' }}>
                      🔒 Изучите вид, поймав первую рыбу
                    </div>
                  )}
                </div>

                {/* 7. Атлас наживок (На что ловить) */}
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '16px',
                    padding: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#4ade80', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🪱</span>
                    <span>Атлас наживок:</span>
                  </div>
                  {isDiscovered ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                      {AVAILABLE_BAITS.map((bait) => {
                        const pref = inspectedFish.baitPreferences[bait.id] || 0;
                        const badge = getBaitBadge(pref);
                        return (
                          <div
                            key={bait.id}
                            style={{
                              background: badge.bg,
                              border: `1px solid ${badge.color}30`,
                              borderRadius: '10px',
                              padding: '5px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ fontSize: '14px' }}>{bait.icon}</span>
                              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#e2e8f0' }}>{bait.name}</span>
                            </div>
                            <span style={{ fontSize: '9px', fontWeight: 900, color: badge.color }}>
                              {badge.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '10.5px', color: '#64748b', textAlign: 'center', padding: '6px 0' }}>
                      🔒 Наживки неизвестны. Поймайте особь для заполнения атласа.
                    </div>
                  )}
                </div>

                {/* 8. Ареал обитания */}
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '16px',
                    padding: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#cbd5e1', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📍</span>
                    <span>Места обитания:</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                    {Object.keys(inspectedFish.habitats).length > 0 ? (
                      Object.keys(inspectedFish.habitats)
                        .map((locId) => LOCATIONS.find((l) => l.id === locId)?.name || locId)
                        .join(' • ')
                    ) : (
                      'Встречается повсеместно'
                    )}
                  </div>
                </div>

                {/* 9. Кнопка закрытия */}
                <button
                  onClick={() => setInspectedFish(null)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '14px',
                    border: 'none',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                    marginTop: '4px',
                  }}
                >
                  Закрыть досье
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
