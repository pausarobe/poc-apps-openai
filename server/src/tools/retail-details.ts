import type { RegisterToolFn, Look, LookItem, Item } from '../utils/types'; 
import { errorMessage } from '../utils/helpers.js';
import z from 'zod';

type ItemsProduct = {
  uid: string;
  id: number;
  sku: string;
  name: string;
  descripcion?: string; 
  price_range: {
    minimum_price: {
      regular_price: { value: number; currency: string; };
    };
  };
  image?: { url: string; };
  related_products?: Array<{
    uid: string;
    sku: string;
    name: string;
    thumbnail?: { url: string };
    price_range?: {
      minimum_price: {
        regular_price: { value: number; currency: string };
      };
    };
  }>;
};

export function registerRetailDetailTool(registerTool: RegisterToolFn) {
  registerTool(
    'retail-detail',
    {
      title: 'Retail Detail',
      description: `Retrieve detailed information for a single look from a specific catalog. 
      Only call this tool when the user explicitly provides a product SKU`,
      _meta: {
        'openai/outputTemplate': 'ui://widget/retail-details.html',
        'openai/toolInvocation/invoking': 'Consultando detalle en Magento Cloud...',
        'openai/toolInvocation/invoked': 'Detalle cargado correctamente',
      },
      inputSchema: {
        sku: z.string().describe('El SKU del producto o look'),
      },
    },
    async ({ catalog, sku, inputParameters }: { catalog: 'looks' | 'items', sku: string, inputParameters: { id: string, categoryId: string } }) => {
      console.error('Joining retail-detail', catalog, sku, inputParameters);
      const ACCESS_TOKEN = process.env.PROVIDER_CARS_API_KEY;

      if (!ACCESS_TOKEN) return errorMessage('Falta el Token de acceso.');

      try {
        const GRAPHQL_URL = `https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/graphql`;
        
        const gqlQuery = `query GetProductWithRelated($sku: String!) {
          products(filter: { sku: { eq: $sku } }) {
            items {
              uid
              sku
              name
              descripcion
              image { url }
              price_range {
                minimum_price { regular_price { value currency } }
              }
              related_products {
                sku
                name
                thumbnail { url }
                price_range {
                  minimum_price { regular_price { value currency } }
                }
              }
            }
          }
        }`;

        const gqlResponse = await fetch(GRAPHQL_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`
          },
          body: JSON.stringify({ query: gqlQuery, variables: { sku } })
        });

        if (!gqlResponse.ok) return errorMessage('Error de red con Magento.');
        // console.error('GraphQL REQUEST:', { gqlResponse });
       
        const gqlResult = await gqlResponse.json() as { 
          data?: { products?: { items: ItemsProduct[] } }, 
          errors?: { message: string }[] 
        };
        
        // console.error('GraphQL REQUEST2 :', { gqlResult });
        
        if (gqlResult?.errors && gqlResult.errors.length > 0) {
          console.error('GraphQL Errors:', gqlResult.errors);
          return errorMessage('Error en la consulta de Magento.');
        }

        // console.error('GraphQL REQUEST2 :', { gqlResult: gqlResult.data?.products?.items });


        const gqlItem = gqlResult.data?.products?.items[0];

        console.error('GraphQL REQUEST2 :', { gqlResult: gqlResult.data?.products?.items.length });

        if (!gqlItem) return errorMessage('No se ha encontrado el producto solicitado.');

        
        const item: Item = {
          uid: gqlItem.uid,
          sku: gqlItem.sku,
          name: gqlItem.name,
          description: gqlItem.descripcion || 'Sin descripción',
          image: { 
            label: gqlItem.name, 
            url: gqlItem.image?.url || '' 
          },
          price: gqlItem.price_range?.minimum_price?.regular_price?.value ?? 0,
          related_products: gqlItem.related_products?.map(rel => ({
            uid: rel.uid,
            sku: rel.sku,
            name: rel.name,
            image: rel.thumbnail ? {
              label: rel.name,
              url: rel.thumbnail.url
            } : undefined,
            price: rel.price_range?.minimum_price?.regular_price?.value ?? 0,
            currency: rel.price_range?.minimum_price?.regular_price?.currency ?? 'EUR'
          })) || []
        };

        console.error('FINAL :', item.name, item.related_products?.length);


        return {
          content: [{
            type: 'text' as const,
            text: `Detalles de ${item.name} cargados correctamente.`
          }],
          structuredContent: { item, category: `retail_${catalog}` },
        };

      } catch (error) {
        console.error('Error fetching retail catalog:', error);
        return errorMessage('Hubo un problema al conectar con el catálogo de moda.');
      }
    },
  );
}