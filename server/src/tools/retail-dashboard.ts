import type { ItemList, LookList, RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import z from 'zod';

type LookProduct = {
  uid: string;
  id: number;
  sku: string;
  name: string;
  descripcion?: string;
  genero?: string;
  tiempo?: string;
  ocasion?: string;

  price_range: {
    minimum_price: {
      regular_price: {
        value: number;
        currency: "EUR";
      };
    };
  };
  image?: {
    label: string;
    url: string;
  };
  thumbnail?: {
    label: string;
    url: string;
  };
  custom_attributes?: Array<{
    attribute_code: string;
    value: string | null;
  }>;
  related_products: Array<{
    uid: string;
    sku: string;
    name: string;
  }>;
};

export function registerRetailDashboardTool(registerTool: RegisterToolFn) {
  registerTool(
    'retail-dashboard',
    {
      title: 'Retail Catalog',
      description: `Search for products in the fashion and retail catalog. Use this tool when the user wants to see clothing sets, outfits, or looks by style (urban, formal) or by weather (winter, summer).
                    Select catalog='looks' to see complete sets (Outfits). Select catalog='items' to see individual garments. 
                    By default, if the user wants to see general options, use catalog='looks'.`,
      _meta: {
        'openai/outputTemplate': 'ui://widget/retail-dashboard.html',
        'openai/toolInvocation/invoking': 'Buscando las mejores tendencias...',
        'openai/toolInvocation/invoked': 'Catálogo de moda cargado',
      },
      inputSchema: {
        catalog: z.enum(['looks', 'items']).default('looks').describe('El tipo de catálogo: looks (conjuntos) o items (prendas sueltas)'),
        search: z.string().optional().describe('Estilo, clima u ocasión (ej: "invierno", "deportivo")'),
      }
    },
    async ({ catalog, search }: { catalog: 'looks' | 'items', search?: string }) => {
      console.log('Joining retail-dashboard', catalog, search);
      const ACCESS_TOKEN = process.env.PROVIDER_CARS_API_KEY;
      const catalogId = catalog === 'looks' ? '47' : '48';

      if (!ACCESS_TOKEN) {
        console.error('ERROR: PROVIDER_CARS_API_KEY no está definida.');
        return errorMessage('Error de configuración: Falta el Token.');
      }

      try {
        const GRAPHQL_URL = `https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/graphql`;
        
       
        const gqlQuery = `query GetItems($id: String!, $search: String) {
  products(
    search: $search,
    filter: { category_id: { eq: $id } }
  ) {
    items {
      uid
      id
      sku
      name
      # Campos directos (deben estar activos en el Admin de Magento como "Visible in GraphQL")
      genero
      tiempo
      ocasion
      descripcion
      price_range {
        minimum_price {
          regular_price {
            currency
            value
          }
        }
      } 
      image {
        label
        url
      }
      thumbnail {
        label
        url
      }
      related_products {
        uid
        sku
        name
      }
      
    }
  }
}`;

        const gqlResponse = await fetch(GRAPHQL_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Store': catalog === 'looks' ? 'Looks' : 'items',
            'Authorization': `Bearer ${ACCESS_TOKEN}`
          },
          body: JSON.stringify({
            query: gqlQuery,
            variables: { id: catalogId, search }
          })
        });

        if (!gqlResponse.ok) {
          const errorText = await gqlResponse.text();
          console.error('Error de Magento (HTML):', errorText);
          return errorMessage('Magento devolvió un error HTML. Revisa la consola.');
        }

        const gqlResult = await gqlResponse.json() as { data?: { products?: { items: LookProduct[] } }, errors?: { message: string }[] };

        if (gqlResult?.errors && gqlResult.errors.length > 0) {
          console.error('GraphQL Errors:', gqlResult.errors);
          throw new Error();
        }

        const gqlItems = gqlResult.data?.products?.items || [];

      
       const lookList: LookList = gqlItems.map((item: any) => ({
        uid: item.uid,    
        name: item.name,
        id: item.id,   
        sku: item.sku,
        image: item.image, 
        thumbnail: item.thumbnail,
        price: 0,
        description: '',
        category: 'Looks',

        properties: {}, 
        
        product_links: [],
        custom_attributes: []
      }));

        return {
          content: [{
            type: 'text' as const,
            text: `He encontrado ${lookList.length} looks disponibles en el catálogo de moda.`
          }],
          structuredContent: { lookList, category: `retail_${catalog}` },
        };

      } catch (error) {
        console.error('Error fetching retail catalog:', error);
        return errorMessage('Hubo un problema al conectar con el catálogo de moda.');
      }
    },
  );
}