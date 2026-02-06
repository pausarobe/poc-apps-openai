import { useEffect } from 'react';
import type { Item } from '../lib/types';
import item from '../mock/item.json' with { type: 'json' };
import ItemDetail from './item-detail';

function MockToolOutput({ item, children }: { item: Item; children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openai = {
        toolOutput: {
          item: item,
        },
      };

      window.dispatchEvent(new Event('openai:set_globals'));
    }
  }, [item]);
  return <>{children}</>;
}
export const ItemDetailIA = () => {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px' }}>
      <MockToolOutput item={item.item as Item}>
        <ItemDetail />
      </MockToolOutput>
    </div>
  );
};
