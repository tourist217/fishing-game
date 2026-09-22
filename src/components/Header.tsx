interface HeaderProps {
  userName: string;
  level: number;
  coins: number;
  exp: number;
  maxExp: number;
  rodName?: string;
  rodIcon?: string;
  onResetProgress?: () => void;
}

export const Header = ({
  userName,
  level,
  coins,
  exp,
  maxExp,
  rodName = 'Бамбуковая удочка',
  rodIcon = '🎋',
  onResetProgress,
}: HeaderProps) => {
  const handleReset = () => {
    const confirmed = window.confirm('Точно сбросить весь прогресс до 1 уровня?');
    if (confirmed) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const expPercentage = Math.min(100, Math.max(0, (exp / maxExp) * 100));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '12px 16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{userName}</div>
          <div style={{ fontSize: '12px', color: '#38bdf8' }}>
            Уровень {level} • {rodIcon} {rodName}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fbbf24' }}>
              🪙 {coins}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a78bfa' }}>
              ⭐ {exp} / {maxExp}
            </div>
          </div>

          <button
            onClick={onResetProgress || handleReset}
            title="Сбросить прогресс"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Сброс
          </button>
        </div>
      </div>

      {/* Шкала опыта */}
      <div
        style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${expPercentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #818cf8, #c084fc)',
            borderRadius: '3px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};