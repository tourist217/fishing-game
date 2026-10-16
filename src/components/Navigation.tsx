export type ActiveTab = 'fishing' | 'inventory' | 'shop';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  inventoryCount: number;
}

export const Navigation = ({
  activeTab,
  onTabChange,
  inventoryCount,
}: NavigationProps) => {
  const tabs = [
    {
      id: 'fishing',
      label: 'Водоём',
      icon: '🎣',
    },
    {
      id: 'inventory',
      label: 'Садок',
      icon: '🧺',
      badge: inventoryCount > 0 ? inventoryCount : undefined,
    },
    {
      id: 'shop',
      label: 'Магазин',
      icon: '🏪',
      subBadge: '2.5',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(18, 26, 38, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '26px',
        padding: '6px 8px',
        border: '1px solid rgba(255, 255, 255, 0.14)',
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
            onClick={() => onTabChange(tab.id as ActiveTab)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              padding: '10px 10px',
              border: isActive ? '1.5px solid #4ade80' : '1.5px solid transparent',
              background: isActive
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.24) 0%, rgba(16, 185, 129, 0.14) 100%)'
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
                fontSize: '20px',
                lineHeight: 1,
                filter: isActive ? 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.7))' : 'none',
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

            {/* Дополнительный мини-бейдж магазина как на референсе */}
            {tab.subBadge && (
              <span
                style={{
                  background: 'rgba(56, 189, 248, 0.22)',
                  color: '#38bdf8',
                  fontSize: '9px',
                  fontWeight: 800,
                  borderRadius: '6px',
                  padding: '1px 4px',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                }}
              >
                {tab.subBadge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};