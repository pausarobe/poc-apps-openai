import { useEffect } from 'react';
import type { ItemList } from '../lib/types';
import ItemDashboard from './item-dashboard';
import itemList from '../mock/items.json' with { type: 'json' };

function MockToolOutput({ itemList, children }: { itemList: ItemList; children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openai = {
        toolOutput: {
          itemList: itemList,
        },
      };

      window.dispatchEvent(new Event('openai:set_globals'));
    }
  }, [itemList]);
  return <>{children}</>;
}
export const ItemDashboardIA = () => {
  const items = itemList.items;
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px' }}>
      <MockToolOutput itemList={items}>
        <ItemDashboard />
      </MockToolOutput>
    </div>
  );
};
