import { useEffect } from 'react';
import type { Item } from '../lib/types';
import item from '../mock/item.json' with { type: 'json' };

import itemLookDeportivo from '../mock/item-look-deportivo.json' with { type: 'json' };
import subitemsLookDeportivoList from '../mock/subitems-look-deportivo-list.json' with { type: 'json' };
import ItemDetail from './item-detail-subitems';

function MockToolOutput({ 
  item, 
  itemList, 
  category, 
  children 
}: { 
  item: Item; 
  itemList?: Item[]; 
  category?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openai = {
        toolOutput: {
          item: item,
          itemList: itemList || [],
          category: category || '',
        },
      };

      window.dispatchEvent(new Event('openai:set_globals'));
    }
  }, [item, itemList, category]);
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


export const ItemDetailLookDeportivo = () => {
  const gqlItem = itemLookDeportivo.item;
  const mainItem: Item = {
    uid: gqlItem.uid,
    sku: gqlItem.sku,
    name: gqlItem.name,
    price: gqlItem.price_range.minimum_price.regular_price.value,
    description: gqlItem.descripcion,
    image: gqlItem.image,
    custom_attributes: []
  };

  const subitems: Item[] = subitemsLookDeportivoList.data.products.items.map((subitem) => ({
    uid: subitem.uid,
    sku: subitem.sku,
    name: subitem.name,
    price: subitem.price_range.minimum_price.regular_price.value,
    description: subitem.descripcion,
    image: subitem.image,
    custom_attributes: []
  }));

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px' }}>
      <MockToolOutput item={mainItem} itemList={subitems} category="Fashion">
        <ItemDetail />
      </MockToolOutput>
    </div>
  );
};
