import { useEffect } from 'react';
import type { ItemList } from '../lib/types';
import ItemDashboard from './item-dashboard';
import itemList from '../mock/item.json' with { type: 'json' };

function MockToolOutput({ itemList, showForm, children }: { itemList?: ItemList; showForm?: boolean; children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openai = {
        toolOutput: {
          itemList,
          showForm
        },
      } as any;

      window.dispatchEvent(new Event('openai:set_globals'));
    }
  }, [itemList, showForm]);
  return <>{children}</>;
}
export const CatalogoCochesIA = () => {
  // Extraemos los coches del JSON local
  const items = (itemList as any).items || (Array.isArray(itemList) ? itemList : []);
  console.log('Número de coches en el mock:', items);
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px' }}>
      <MockToolOutput itemList={items} >
        <ItemDashboard />
      </MockToolOutput>
    </div>
  );
};
