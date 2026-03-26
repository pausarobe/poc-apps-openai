import { useEffect } from 'react';
import type { Item } from '../lib/types';
import item from '../mock/item.json' with { type: 'json' };
import ItemDetail from './item-detail';
import type { MetaData } from '../lib/openai';

function MockToolOutput({ item, children, metaData }: { item: Item; children: React.ReactNode; metaData?: MetaData }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openai = {
        toolOutput: {
          item: item,
          metaData: metaData
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
      <MockToolOutput item={itemList} metaData={{colorPalette: "red"}}>
        <ItemDetail />
      </MockToolOutput>
    </div>
  );
};
