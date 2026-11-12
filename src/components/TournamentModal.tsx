import React, { useState, useEffect } from 'react';
import {
  fetchLeaderboard,
  getLocalTournamentStats,
  type LeaderboardEntry,
} from '../services/tournamentService';
import { getPlayerIdentity } from '../firebase';
import { CoinIcon } from './CoinIcon';
import { GemIcon } from './GemIcon';

interface TournamentModalProps {
  onClose: () => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({ onClose }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const identity = getPlayerIdentity();
  const localStats = getLocalTournamentStats();

  // Расчёт времени до конца недели (воскресенье 23:59:59)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfWeek = new Date(now);
      const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
      const daysUntilSunday = (7 - dayOfWeek) % 7;

      endOfWeek.setDate(now.getDate() + daysUntilSunday);
      endOfWeek.setHours(23, 59, 59, 999);

      const diff = Math.max(0, endOfWeek.getTime() - now.getTime());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      if (days > 0) {
        setTimeLeft(`${days}д ${hours}ч ${minutes}м`);
      } else {
        setTimeLeft(`${hours}ч ${minutes}м`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Однократная загрузка при открытии модального окна
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    const data = await fetchLeaderboard();
    const stats = getLocalTournamentStats();

    // Смержим локальный рекорд игрока
    let hasCurrent = false;
    const merged = data.map((item) => {
      if (item.id === identity.id) {
        hasCurrent = true;
        return {
          ...item,
          name: identity.name,
          bestCatchWeight: Math.max(item.bestCatchWeight, stats.bestCatchWeight),
          totalScore: Math.max(item.totalScore, stats.totalScore),
        };
      }
      return item;
    });

    if (!hasCurrent && (stats.bestCatchWeight > 0 || stats.totalScore > 0)) {
      merged.push({
        id: identity.id,
        name: identity.name,
        username: identity.username || '',
        bestCatchWeight: stats.bestCatchWeight,
        totalScore: stats.totalScore,
        updatedAt: Date.now(),
        rank: 1,
      });
    }

    merged.sort((a, b) => b.bestCatchWeight - a.bestCatchWeight);
    const top20 = merged.slice(0, 20).map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    setLeaderboard(top20);

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Поиск позиции текущего игрока в топ-20
  const playerRankIndex = leaderboard.findIndex((item) => item.id === identity.id);
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
            background: 'linear-gradient(180deg, #2a2414 0%, #151b26 100%)',
            borderBottom: '1px solid rgba(251, 191, 36, 0.25)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '26px' }}>🏆</span>
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
              Недельный турнир
            </h2>
          </div>

          <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
            Дисциплина: <strong style={{ color: '#fef08a' }}>«Охота за гигантом»</strong>
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '20px',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              fontSize: '11px',
              color: '#fef08a',
              fontWeight: 700,
            }}
          >
            ⏳ До финиша: {timeLeft || 'расчёт...'}
          </div>

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

        {/* Prize Pool Banner */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            padding: '8px 10px',
            background: 'rgba(251, 191, 36, 0.05)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '11px',
          }}
        >
          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ color: '#fbbf24', fontWeight: 800 }}>🥇 1:</span>
            <span style={{ color: '#f8fafc', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              3 000 <CoinIcon size={12} /> + 5 <GemIcon size={12} />
            </span>
          </div>
          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ color: '#cbd5e1', fontWeight: 800 }}>🥈 2:</span>
            <span style={{ color: '#f8fafc', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              2 000 <CoinIcon size={12} />
            </span>
          </div>
          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ color: '#b45309', fontWeight: 800 }}>🥉 3:</span>
            <span style={{ color: '#f8fafc', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              1 000 <CoinIcon size={12} />
            </span>
          </div>
        </div>

        {/* Tournament Rules / Discipline Hint */}
        <div
          style={{
            margin: '8px 14px 2px',
            padding: '8px 12px',
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '15px', lineHeight: 1 }}>💡</span>
          <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4, textAlign: 'left' }}>
            <strong style={{ color: '#38bdf8' }}>Охота за гигантом:</strong> в зачёт принимаются <strong style={{ color: '#fef08a' }}>все виды рыб</strong> на любых локациях. Рекордом становится ваш самый крупный пойманный экземпляр!
          </div>
        </div>

        {/* Current Player Card */}
        <div
          style={{
            margin: '10px 14px 4px',
            padding: '10px 14px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(18, 33, 53, 0.5) 100%)',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🎣</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                {identity.name}
              </div>
              <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                Ваш рекорд: <strong style={{ color: '#38bdf8' }}>{localStats.bestCatchWeight > 0 ? `${localStats.bestCatchWeight.toFixed(3)} кг` : 'пока нет'}</strong>
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

        {/* Table Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 14px 14px',
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
            <span>Таблица лидеров (Топ-20)</span>
            <button
              disabled={refreshing}
              onClick={() => loadData(true)}
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
              Загрузка таблицы лидеров...
            </div>
          ) : leaderboard.length === 0 ? (
            <div
              style={{
                padding: '30px 16px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '14px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>🏆</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                Турнир только стартовал!
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Поймайте крупную рыбу, чтобы занять 1-е место в таблице лидеров.
              </div>
            </div>
          ) : (
            leaderboard.map((item, idx) => {
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
                    <div>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 800,
                          color: isCurrentPlayer ? '#fbbf24' : '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {item.name}
                        {isCurrentPlayer && (
                          <span style={{ fontSize: '9px', padding: '1px 4px', borderRadius: '4px', background: '#f59e0b', color: '#000', fontWeight: 900 }}>
                            ВЫ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#38bdf8' }}>
                      {item.bestCatchWeight.toFixed(3)} кг
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>
                      Всего: {item.totalScore.toFixed(1)} кг
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
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
          <span>Зачёт: по весу 1 самой крупной рыбы</span>
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>🏆 Награждение в воскресенье</span>
        </div>
      </div>
    </div>
  );
};
