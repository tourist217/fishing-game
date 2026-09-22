export type ActiveTab = 'fishing' | 'inventory' | 'shop';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  inventoryCount: number;
}

export const Navigation = ({ activeTab, onTabChange, inventoryCount }: NavigationProps) => {
  return (
    <div
      style={{
        display: 'flex',
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '16px',
        padding: '4px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        gap: '4px',
      }}
    >
      <button
        onClick={() => onTabChange('fishing')}
        style={{
          flex: 1,
          padding: '10px 4px',
          border: 'none',
          borderRadius: '12px',
          background: activeTab === 'fishing' ? '#2563eb' : 'transparent',
          color: activeTab === 'fishing' ? '#ffffff' : '#94a3b8',
          fontWeight: 'bold',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        Рыбалка 🎣
      </button>
      <button
        onClick={() => onTabChange('inventory')}
        style={{
          flex: 1,
          padding: '10px 4px',
          border: 'none',
          borderRadius: '12px',
          background: activeTab === 'inventory' ? '#2563eb' : 'transparent',
          color: activeTab === 'inventory' ? '#ffffff' : '#94a3b8',
          fontWeight: 'bold',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        Садок 🧺 {inventoryCount > 0 && `(${inventoryCount})`}
      </button>
      <button
        onClick={() => onTabChange('shop')}
        style={{
          flex: 1,
          padding: '10px 4px',
          border: 'none',
          borderRadius: '12px',
          background: activeTab === 'shop' ? '#2563eb' : 'transparent',
          color: activeTab === 'shop' ? '#ffffff' : '#94a3b8',
          fontWeight: 'bold',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        Магазин 🛒
      </button>
    </div>
  );
};