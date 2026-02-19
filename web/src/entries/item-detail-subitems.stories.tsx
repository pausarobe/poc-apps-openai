import { useEffect } from 'react';
import type { Item } from '../lib/types';

import ItemDetail from './item-detail-subitems';
import itemLookRelatedData from '../mock/item-look-related.json';

function MockToolOutput({ 
  item, 
  category, 
  children 
}: { 
  item: Item; 
  category?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openai = {
        toolOutput: {
          item: item,
          category: category || '',
        },
      };

      window.dispatchEvent(new Event('openai:set_globals'));
    }
  }, [item, category]);
  return <>{children}</>;
}

export const ItemDetailLookRelated = () => {
  const gqlData = itemLookRelatedData.data.products.items[0];
  
  if (!gqlData) {
    return <div>No data available</div>;
  }

  const mainItem: Item = {
    uid: gqlData.uid,
    name: gqlData.name,
    sku: gqlData.sku,
    image: {
      label: gqlData.name,
      url: gqlData.image.url
    },
    thumbnail: {
      label: gqlData.name,
      url: gqlData.image.url
    },
    related_products: gqlData.related_products.map((product: any) => ({
      uid: product.sku,
      sku: product.sku,
      name: product.name,
      thumbnail: {
        label: product.name,
        url: product.thumbnail.url
      },
      price: product.price_range.minimum_price.regular_price.value,
      image: {
        label: product.name,
        url: product.thumbnail.url
      },
    })),
    custom_attributes: []
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px' }}>
      <MockToolOutput item={mainItem} category="Fashion">
        <ItemDetail />
      </MockToolOutput>
    </div>
  );
};
