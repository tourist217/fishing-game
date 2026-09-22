interface HeaderProps {
  userName: string;
  level: number;
  coins: number;
  exp: number;
  rodName?: string;
  rodIcon?: string;
}

export const Header = ({
  userName,
  level,
  coins,
  exp,
  rodName = 'Бамбуковая удочка',
  rodIcon = '🎋',
}: HeaderProps) => {
  return (
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
        <div style={{ fontSize: '12px', color: '#38bdf8' }}>
          Уровень {level} • {rodIcon} {rodName}
        </div>
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
  );
};