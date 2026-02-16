import { useEffect } from 'react';
import type { Item } from '../lib/types';
import item from '../mock/item.json' with { type: 'json' };
import ItemDetail from './item-detail-subitems';

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
  const gqlItem = item.item;
  const itemList: Item = {
    uid: gqlItem.uid,
    sku: gqlItem.sku,
    name: gqlItem.name,
    price: gqlItem.price_range.minimum_price.regular_price.value,
    description: gqlItem.descripcion,
    image: gqlItem.image,
    custom_attributes: []
  };
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px' }}>
      <MockToolOutput item={itemList}>
        <ItemDetail />
      </MockToolOutput>
    </div>
  );
};
