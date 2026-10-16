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
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '22px',
        padding: '6px 8px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        gap: '6px',
        zIndex: 20,
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
              gap: '8px',
              padding: '10px 8px',
              border: 'none',
              background: isActive
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(16, 185, 129, 0.12) 100%)'
                : 'transparent',
              borderRadius: '16px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Иконка */}
            <span
              style={{
                fontSize: '22px',
                lineHeight: 1,
                filter: isActive ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))' : 'none',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
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
                  fontWeight: 800,
                  borderRadius: '10px',
                  padding: '1px 6px',
                  marginLeft: '2px',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.6)',
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