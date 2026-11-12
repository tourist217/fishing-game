import React, { useState, useEffect } from 'react';
import {
  fetchGlobalLeaderboard,
  type GlobalLeaderboardEntry,
  type LeaderboardSortBy,
} from '../services/leaderboardService';
import { getPlayerIdentity } from '../firebase';
import { getTotalCaughtWeight, flushImmediateCloudSync } from '../services/cloudSyncService';

interface LeaderboardModalProps {
  playerLevel: number;
  playerExp: number;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  playerLevel,
  playerExp,
  onClose,
}) => {
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>('level');
  const [entries, setEntries] = useState<GlobalLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const identity = getPlayerIdentity();
  const totalWeight = getTotalCaughtWeight();

  const loadData = async (type: LeaderboardSortBy, isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      // Гарантируем, что перед запросом свежего глобального лидерборда
      // все наши локальные изменения (выловленный вес, уровень, опыт) уже сохранены в Firestore
      await flushImmediateCloudSync();
    } catch (e) {
      console.warn('Leaderboard pre-fetch sync failed:', e);
    }

    const data = await fetchGlobalLeaderboard(type);
    const currentWeight = getTotalCaughtWeight();

    // Смержим локальные актуальные данные текущего игрока,
    // чтобы исключить даже малейшую задержку репликации базы данных
    let hasCurrent = false;
    const merged = data.map((item) => {
      if (item.id === identity.id) {
        hasCurrent = true;
        return {
          ...item,
          name: identity.name,
          level: Math.max(item.level, playerLevel),
          exp: Math.max(item.exp, playerExp),
          totalCaughtWeight: Math.max(item.totalCaughtWeight, currentWeight),
        };
      }
      return item;
    });

    if (!hasCurrent && (playerLevel > 1 || currentWeight > 0)) {
      merged.push({
        id: identity.id,
        name: identity.name,
        level: playerLevel,
        exp: playerExp,
        totalCaughtWeight: currentWeight,
        trophiesCount: 0,
        rank: 1,
      });
    }

    if (type === 'level') {
      merged.sort(
        (a, b) => b.level - a.level || b.exp - a.exp || b.totalCaughtWeight - a.totalCaughtWeight
      );
    } else {
      merged.sort(
        (a, b) => b.totalCaughtWeight - a.totalCaughtWeight || b.level - a.level
      );
    }

    const top20 = merged.slice(0, 20).map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    setEntries(top20);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData(sortBy);
  }, [sortBy]);

  // Место текущего игрока
  const playerRankIndex = entries.findIndex((e) => e.id === identity.id);
  const playerRank = playerRankIndex !== -1 ? playerRankIndex + 1 : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 12, 22, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '90vh',
          backgroundColor: '#121e2d',
          borderRadius: '24px',
          border: '2px solid rgba(251, 191, 36, 0.4)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'relative',
            padding: '16px 18px 12px',
            background: 'linear-gradient(180deg, #1e293b 0%, #111a28 100%)',
            borderBottom: '1px solid rgba(251, 191, 36, 0.25)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{ fontSize: '24px' }}>🏆</span>
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 900,
                color: '#fbbf24',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              Зал славы рыбаков
            </h2>
          </div>

          <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8' }}>
            Глобальный рейтинг лучших рыболовов
          </p>

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94a3b8',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs: Level vs Total Weight */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            padding: '10px 14px 6px',
            background: '#0e1824',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <button
            onClick={() => setSortBy('level')}
            style={{
              padding: '8px 10px',
              borderRadius: '12px',
              border: sortBy === 'level' ? '1.5px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.08)',
              background: sortBy === 'level'
                ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)'
                : 'rgba(255, 255, 255, 0.03)',
              color: sortBy === 'level' ? '#fbbf24' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            ⭐ По уровню
          </button>

          <button
            onClick={() => setSortBy('totalWeight')}
            style={{
              padding: '8px 10px',
              borderRadius: '12px',
              border: sortBy === 'totalWeight' ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
              background: sortBy === 'totalWeight'
                ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(2, 132, 199, 0.1) 100%)'
                : 'rgba(255, 255, 255, 0.03)',
              color: sortBy === 'totalWeight' ? '#38bdf8' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            ⚖️ По общему улову
          </button>
        </div>

        {/* Current Player Card */}
        <div
          style={{
            margin: '8px 14px 4px',
            padding: '10px 14px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.45) 0%, rgba(18, 33, 53, 0.45) 100%)',
            border: '1.5px solid rgba(56, 189, 248, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>👤</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                {identity.name}
              </div>
              <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                {sortBy === 'level' ? (
                  <>Уровень: <strong style={{ color: '#fbbf24' }}>{playerLevel}</strong> ({playerExp} XP)</>
                ) : (
                  <>Общий улов: <strong style={{ color: '#38bdf8' }}>{totalWeight.toFixed(1)} кг</strong></>
                )}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Место</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: playerRank ? '#fbbf24' : '#64748b' }}>
              {playerRank ? `#${playerRank}` : 'Вне Топ-20'}
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '6px 14px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 6px',
              fontSize: '11px',
              color: '#94a3b8',
              fontWeight: 700,
            }}
          >
            <span>Рейтинг (Топ-20)</span>
            <button
              disabled={refreshing}
              onClick={() => loadData(sortBy, true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              {refreshing ? 'Обновление...' : '🔄 Обновить'}
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px', animation: 'spin 1.5s linear infinite' }}>⏳</div>
              Загрузка зала славы...
            </div>
          ) : entries.length === 0 ? (
            <div
              style={{
                padding: '30px 16px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '14px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>⭐</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                Рейтинг формируется!
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Ловите рыбу и повышайте уровень, чтобы занять верхние строчки.
              </div>
            </div>
          ) : (
            entries.map((item, idx) => {
              const isCurrentPlayer = item.id === identity.id;
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    background: isCurrentPlayer
                      ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.08) 100%)'
                      : idx < 3
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: isCurrentPlayer
                      ? '1.5px solid rgba(251, 191, 36, 0.6)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '24px',
                        textAlign: 'center',
                        fontSize: idx < 3 ? '16px' : '12px',
                        fontWeight: 900,
                        color: idx < 3 ? '#fbbf24' : '#94a3b8',
                      }}
                    >
                      {medal}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 800,
                          color: isCurrentPlayer ? '#fbbf24' : '#f8fafc',
                        }}
                      >
                        {item.name}
                      </span>
                      {isCurrentPlayer && (
                        <span
                          style={{
                            fontSize: '9px',
                            padding: '1px 4px',
                            borderRadius: '4px',
                            background: '#f59e0b',
                            color: '#000',
                            fontWeight: 900,
                          }}
                        >
                          ВЫ
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {sortBy === 'level' ? (
                      <>
                        <div style={{ fontSize: '13px', fontWeight: 900, color: '#fbbf24' }}>
                          ⭐ {item.level} ур.
                        </div>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>
                          {item.exp} XP
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '13px', fontWeight: 900, color: '#38bdf8' }}>
                          ⚖️ {item.totalCaughtWeight.toFixed(1)} кг
                        </div>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>
                          Ур. {item.level}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 16px',
            background: 'rgba(10, 16, 26, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '10.5px',
            color: '#94a3b8',
          }}
        >
          <span>🏆 Данные обновляются в реальном времени</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
