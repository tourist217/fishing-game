export type ActiveTab = 'fishing' | 'inventory' | 'shop';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  inventoryCount: number;
}

// 1. Иконка рюкзака (Инвентарь) в точности по стилю референса
export const BackpackNavIcon = ({ active = false }: { active?: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
    {/* Верхняя ручка */}
    <path
      d="M12 9 C12 6, 20 6, 20 9"
      stroke={active ? '#4ade80' : '#d97706'}
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Тело рюкзака */}
    <path
      d="M7 13 C7 10, 10 9, 16 9 C22 9, 25 10, 25 13 L24 25 C24 28, 22 29, 16 29 C10 29, 8 28, 7 25 Z"
      fill="url(#bpBrownGrad)"
      stroke={active ? '#4ade80' : '#78350f'}
      strokeWidth="1.2"
    />
    {/* Передний клапан */}
    <path
      d="M9 10 L23 10 L22 18 C22 20, 19 21, 16 21 C13 21, 10 20, 10 18 Z"
      fill="#92400e"
      stroke={active ? '#86efac' : '#b45309'}
      strokeWidth="1"
    />
    {/* Пряжки и ремешки */}
    <rect x="12" y="14" width="2" height="8" rx="1" fill="#fde047" />
    <rect x="18" y="14" width="2" height="8" rx="1" fill="#fde047" />
    <defs>
      <linearGradient id="bpBrownGrad" x1="7" y1="9" x2="25" y2="29" gradientUnits="userSpaceOnUse">
        <stop stopColor="#b45309" />
        <stop offset="1" stopColor="#78350f" />
      </linearGradient>
    </defs>
  </svg>
);

// 2. Иконка лавки (Магазин) в точности по стилю референса
export const ShopNavIcon = ({ active = false }: { active?: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
    {/* Навес с красно-белыми полосами */}
    <path d="M5 13 L8 7 L24 7 L27 13 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
    <path d="M9 7 L11 13 L14 13 L13 7 Z" fill="#ffffff" />
    <path d="M19 7 L18 13 L21 13 L23 7 Z" fill="#ffffff" />
    {/* Волнообразный козырёк */}
    <path
      d="M5 13 Q7 15.5 9 13 Q11 15.5 13 13 Q15 15.5 17 13 Q19 15.5 21 13 Q23 15.5 25 13 Q27 15.5 27 13"
      stroke="#7f1d1d"
      strokeWidth="1.2"
      fill="none"
    />
    {/* Деревянная витрина */}
    <rect
      x="7"
      y="14.5"
      width="18"
      height="12"
      rx="2"
      fill="url(#shopWoodGrad)"
      stroke={active ? '#4ade80' : '#78350f'}
      strokeWidth="1.2"
    />
    {/* Окошко с товаром */}
    <rect x="10" y="17.5" width="12" height="6.5" rx="1.5" fill="#1e293b" />
    <circle cx="16" cy="20.7" r="2.2" fill="#38bdf8" />
    <defs>
      <linearGradient id="shopWoodGrad" x1="7" y1="14.5" x2="25" y2="26.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#d97706" />
        <stop offset="1" stopColor="#92400e" />
      </linearGradient>
    </defs>
  </svg>
);

// 3. Иконка плетёного садка с рыбой
export const KeepnetNavIcon = ({ active = false }: { active?: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
    {/* Ободок садка */}
    <ellipse cx="16" cy="10.5" rx="9.5" ry="3.5" fill="#a16207" stroke={active ? '#4ade80' : '#713f12'} strokeWidth="1.2" />
    {/* Тело корзины */}
    <path
      d="M6.5 10.5 C6.5 18, 9.5 27, 16 27 C22.5 27, 25.5 18, 25.5 10.5 Z"
      fill="url(#basketNavGrad)"
      stroke={active ? '#4ade80' : '#713f12'}
      strokeWidth="1.2"
    />
    {/* Плетение */}
    <path d="M8 15 Q16 18 24 15" stroke="#eab308" strokeWidth="1" fill="none" />
    <path d="M10 20.5 Q16 23 22 20.5" stroke="#eab308" strokeWidth="1" fill="none" />
    {/* Рыбка */}
    <path d="M13.5 11 C13.5 7.5, 18 8, 19 6.5 L20 10.5 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.8" />
    <defs>
      <linearGradient id="basketNavGrad" x1="6.5" y1="10.5" x2="25.5" y2="27" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ca8a04" />
        <stop offset="0.7" stopColor="#a16207" />
        <stop offset="1" stopColor="#713f12" />
      </linearGradient>
    </defs>
  </svg>
);

export const Navigation = ({
  activeTab,
  onTabChange,
  inventoryCount,
}: NavigationProps) => {
  const tabs = [
    {
      id: 'fishing' as ActiveTab,
      label: 'Инвентарь',
      icon: <BackpackNavIcon active={activeTab === 'fishing'} />,
    },
    {
      id: 'shop' as ActiveTab,
      label: 'Магазин',
      icon: <ShopNavIcon active={activeTab === 'shop'} />,
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Садок',
      icon: <KeepnetNavIcon active={activeTab === 'inventory'} />,
      badge: inventoryCount > 0 ? inventoryCount : undefined,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(22, 28, 38, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '26px',
        padding: '6px 8px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 10px 36px rgba(0, 0, 0, 0.55)',
        gap: '6px',
        zIndex: 25,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 8px',
              border: isActive ? '1.5px solid #4ade80' : '1.5px solid transparent',
              background: isActive
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(16, 185, 129, 0.12) 100%)'
                : 'transparent',
              borderRadius: '20px',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: isActive ? '0 0 16px rgba(74, 222, 128, 0.35)' : 'none',
              transition: 'all 0.18s ease',
            }}
          >
            {/* Иконка */}
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: isActive ? 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.6))' : 'none',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.15s ease',
              }}
            >
              {tab.icon}
            </span>

            {/* Лейбл */}
            <span
              style={{
                fontSize: '13px',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#4ade80' : '#94a3b8',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </span>

            {/* Бейдж садка */}
            {tab.badge !== undefined && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 900,
                  borderRadius: '10px',
                  padding: '1px 6px',
                  marginLeft: '2px',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.7)',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};