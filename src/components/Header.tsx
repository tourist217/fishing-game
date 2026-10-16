interface HeaderProps {
  userName: string;
  level: number;
  coins: number;
  exp: number;
  maxExp: number;
  energy?: number;
  maxEnergy?: number;
  onOpenSettings?: () => void;
  onResetProgress?: () => void;
  rodName?: string;
  rodIcon?: string;
}

export const Header = ({
  userName,
  level,
  coins,
  exp,
  maxExp,
  energy = 84,
  maxEnergy = 100,
  onOpenSettings,
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
        marginBottom: '6px',
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

        {/* Энергия */}
        <div
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
          onClick={onOpenSettings || onResetProgress || handleReset}
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
  );
};