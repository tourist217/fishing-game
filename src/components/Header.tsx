import { CoinIcon } from './CoinIcon';
import { EnergyIcon } from './EnergyIcon';

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
  userName,
  level,
  coins,
  exp,
  maxExp,
  energy = 100,
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
        width: '100%',
        marginBottom: '10px',
      }}
    >
      {/* Карточка профиля игрока (слева) */}
      <div
        onClick={onOpenSettings || onResetProgress || handleReset}
        title="Профиль и настройки"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(28, 36, 48, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '4px 12px 4px 5px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            border: '2px solid #38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)',
            flexShrink: 0,
          }}
        >
          🧔
        </div>
        <div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
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
              }}
            >
              Ур. {level}
            </span>
            <div
              style={{
                width: '52px',
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
                  background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Правая группа: Монеты, Термос энергии, Шестерёнка */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Монеты */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(28, 36, 48, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '18px',
            padding: '6px 11px 6px 8px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <CoinIcon size={19} />
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
            {coins.toLocaleString('ru-RU')}
          </span>
        </div>

        {/* Фляга / Энергия */}
        <div
          title="Энергия рыбака"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(28, 36, 48, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '18px',
            padding: '5px 10px 5px 6px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <EnergyIcon size={21} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.2px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: 1,
              }}
            >
              {energy}/{maxEnergy}
            </span>
            {/* Шкала энергии с золотым наполнением */}
            <div
              style={{
                width: '38px',
                height: '4px',
                background: 'rgba(0, 0, 0, 0.55)',
                borderRadius: '3px',
                overflow: 'hidden',
                border: '0.5px solid rgba(251, 191, 36, 0.25)',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, (energy / maxEnergy) * 100))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #d97706, #fbbf24)',
                  boxShadow: '0 0 6px rgba(251, 191, 36, 0.6)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Кнопка настроек шестерёнка */}
        <button
          onClick={onOpenSettings || onResetProgress || handleReset}
          title="Настройки"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '12px',
            background: 'rgba(28, 36, 48, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
            padding: 0,
          }}
        >
          ⚙️
        </button>
      </div>
    </div>
  );
};