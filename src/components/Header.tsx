interface HeaderProps {
  userName: string;
  level: number;
  coins: number;
  gems?: number;
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
  level,
  coins,
  gems = 120,
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
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(28, 33, 29, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '9999px',
        padding: '4px 8px 4px 5px',
        border: '1.5px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        gap: '8px',
        marginBottom: '8px',
      }}
    >
      {/* 1. Уровень игрока со круговым кольцом прогресса EXP */}
      <div
        onClick={onOpenSettings || onResetProgress || handleReset}
        title="Профиль и настройки (нажмите для открытия)"
        style={{
          position: 'relative',
          width: '42px',
          height: '42px',
          flexShrink: 0,
          borderRadius: '50%',
          background: '#1c221e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.6)',
        }}
      >
        <svg
          width="42"
          height="42"
          viewBox="0 0 42 42"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'rotate(-90deg)',
            pointerEvents: 'none',
          }}
        >
          <circle
            cx="21"
            cy="21"
            r="18"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="3.2"
          />
          <circle
            cx="21"
            cy="21"
            r="18"
            fill="none"
            stroke="url(#lvlGoldGradHeader)"
            strokeWidth="3.2"
            strokeDasharray={113.1}
            strokeDashoffset={113.1 - (expPercentage / 100) * 113.1}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="lvlGoldGradHeader" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fde047" />
              <stop offset="1" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
        <span
          style={{
            fontSize: '8.5px',
            fontWeight: 800,
            color: '#94a3b8',
            lineHeight: 1,
            letterSpacing: '0.4px',
          }}
        >
          LV.
        </span>
        <span
          style={{
            fontSize: '16px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1,
            marginTop: '1px',
          }}
        >
          {level}
        </span>
      </div>

      {/* 2. Энергия: Молния + Числа + Зелёный горизонтальный прогресс-бар */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          flex: '1 1 auto',
          minWidth: '72px',
          paddingRight: '2px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <path
              d="M9.5 1.5 L3.5 9 H8.5 L6.5 14.5 L12.5 7 H7.5 L9.5 1.5 Z"
              fill="#facc15"
              stroke="#eab308"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.3px',
              lineHeight: 1,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {energy} / {maxEnergy}
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '6.5px',
            background: '#121914',
            borderRadius: '9999px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, Math.max(0, (energy / maxEnergy) * 100))}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #22c55e, #86efac)',
              borderRadius: '9999px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* 3. Монеты в отдельной капсуле */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'rgba(15, 20, 16, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          padding: '5px 9px 5px 6px',
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="10" cy="10" r="9" fill="url(#coinGradHeader)" stroke="#b45309" strokeWidth="1" />
          <circle cx="10" cy="10" r="6" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" />
          <circle cx="8" cy="8" r="1.5" fill="#fef08a" />
          <defs>
            <linearGradient id="coinGradHeader" x1="2" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fde047" />
              <stop offset="0.6" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#b45309" />
            </linearGradient>
          </defs>
        </svg>
        <span
          style={{
            fontSize: '12.5px',
            fontWeight: 800,
            color: '#fde047',
            letterSpacing: '0.2px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: 1,
          }}
        >
          {coins.toLocaleString('ru-RU')}
        </span>
      </div>

      {/* 4. Алмазы (Gems) в отдельной капсуле */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'rgba(15, 20, 16, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          padding: '5px 9px 5px 6px',
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
          <path d="M6 3 L14 3 L18 8 L10 18 L2 8 Z" fill="url(#gemGradHeader)" stroke="#38bdf8" strokeWidth="1" />
          <path d="M6 3 L10 8 L14 3" stroke="#bae6fd" strokeWidth="0.8" fill="none" />
          <path d="M2 8 L18 8" stroke="#38bdf8" strokeWidth="0.8" />
          <path d="M10 8 L10 18" stroke="#38bdf8" strokeWidth="0.8" />
          <defs>
            <linearGradient id="gemGradHeader" x1="2" y1="3" x2="18" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7dd3fc" />
              <stop offset="0.5" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
          </defs>
        </svg>
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
          {(gems ?? 120).toLocaleString('ru-RU')}
        </span>
      </div>
    </div>
  );
};