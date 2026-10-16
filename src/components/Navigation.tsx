export type ActiveTab = 'fishing' | 'inventory' | 'shop' | 'leaderboard' | 'achievements';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenMap?: () => void;
  inventoryCount: number;
}

export const Navigation = ({
  activeTab,
  onTabChange,
  onOpenMap,
  inventoryCount,
}: NavigationProps) => {
  const tabs = [
    {
      id: 'map',
      label: 'Карта',
      icon: '🗺️',
      isMap: true,
    },
    {
      id: 'inventory',
      label: 'Инвентарь',
      icon: '🎒',
      badge: inventoryCount > 0 ? inventoryCount : undefined,
    },
    {
      id: 'fishing',
      label: 'Водоём',
      icon: '🎣',
    },
    {
      id: 'shop',
      label: 'Магазин',
      icon: '🏪',
    },
    {
      id: 'leaderboard',
      label: 'Лидерборд',
      icon: '🏆',
    },
    {
      id: 'achievements',
      label: 'Достижения',
      icon: '⭐',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '22px',
        padding: '6px 4px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        zIndex: 20,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.isMap && onOpenMap) {
                onOpenMap();
              } else {
                onTabChange(tab.id as ActiveTab);
              }
            }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 2px',
              border: 'none',
              background: isActive
                ? 'linear-gradient(180deg, rgba(34, 197, 94, 0.18) 0%, rgba(16, 185, 129, 0.08) 100%)'
                : 'transparent',
              borderRadius: '14px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Иконка */}
            <div
              style={{
                fontSize: '19px',
                lineHeight: 1,
                marginBottom: '3px',
                filter: isActive ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))' : 'none',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.15s ease',
              }}
            >
              {tab.icon}
            </div>

            {/* Лейбл */}
            <span
              style={{
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#4ade80' : '#94a3b8',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </span>

            {/* Бейдж садка */}
            {tab.badge !== undefined && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: 'calc(50% - 16px)',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  padding: '1px 5px',
                  minWidth: '15px',
                  textAlign: 'center',
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