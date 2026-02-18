import { useEffect } from 'react';
import type { ItemList } from '../lib/types';
import ItemDashboard from './item-dashboard';
// Mocks
import telcoMock from '../mock/items.json' with { type: 'json' };
import looksMock from '../mock/looks.json' with { type: 'json' };

function MockToolOutput({ 
  itemList, 
  category, 
  children 
}: { 
  itemList: ItemList; 
  category: string; 
  children: React.ReactNode 
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openai = {
        toolOutput: {
          itemList: itemList,
          category: category,
        },
      };
      window.dispatchEvent(new Event('openai:set_globals'));
    }
  }, [itemList, category]);
  return <>{children}</>;
}

// FUNCIÓN DE MAPEO ROBUSTA (Asegura que las imágenes y precios carguen siempre)
const mapGqlItems = (gqlItems: any[]): ItemList => {
  return gqlItems.map((item) => {
    let imageUrl = '';
    if (typeof item.image === 'string') {
      imageUrl = item.image;
    } else if (item.image?.url) {
      imageUrl = item.image.url;
    } else if (item.thumbnail?.url) {
      imageUrl = item.thumbnail.url;
    }

    return {
      uid: item.uid || item.sku || String(Math.random()),
      sku: item.sku,
      name: item.name,
      price: item.price_range?.minimum_price?.regular_price?.value ?? item.price ?? 0,
      description: item.descripcion || item.description || '',
      image: {
        label: item.name,
        url: imageUrl
      }
    };
  });
};

// --- STORY 1: RETAIL LOOKS (ESMERALDA) ---
export const DashboardRetailLooks = () => {
  const rawItems = 
    (looksMock as any).data?.products?.items || 
    (looksMock as any).items || 
    (looksMock as any).item || // <--- Esta es la clave que tienes tú
    [];
    
  const items = mapGqlItems(rawItems);
  
  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '20px' }}>
      <MockToolOutput itemList={items} category="retail_looks">
        <ItemDashboard />
      </MockToolOutput>
    </div>
  );
};

// --- STORY 2: TELCO B2B (ÍNDIGO) ---
export const DashboardTelcoB2B = () => {
  const rawItems = (telcoMock as any).data?.products?.items || (telcoMock as any).items || [];
  const items = mapGqlItems(rawItems);
  
  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '20px' }}>
      <MockToolOutput itemList={items} category="telco_b2b">
        <ItemDashboard />
      </MockToolOutput>
    </div>
  );
};

// --- STORY 3: GENERAL B2C (AZUL) ---
export const DashboardGeneralB2C = () => {
  const rawItems = (telcoMock as any).data?.products?.items || (telcoMock as any).items || [];
  const items = mapGqlItems(rawItems);
  
  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '20px' }}>
      <MockToolOutput itemList={items} category="general_catalog">
        <ItemDashboard />
      </MockToolOutput>
    </div>
  );
};