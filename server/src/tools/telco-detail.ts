import type { Item, RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import z from 'zod';

type Product = {
  uid: string;
  id: number;
  sku: string;
  name: string;
  descripcion: string;
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
};

export function registerTelcoDetailTool(registerTool: RegisterToolFn) {
  registerTool(
    'telco-detail',
    {
      title: 'Telco Detail',
      description: `Retrieve detailed information for a single product from a specific catalog.
Only call this tool when the user explicitly provides a product SKU
Select catalog='b2b' when the user intent corresponds to a business context (e.g. wholesale purchasing, VAT/CIF, net pricing, pallets, business account, contractual terms).
Select catalog='b2c' when the user intent corresponds to an individual consumer context (e.g. personal use, size or color, home delivery, returns, final consumer price).
Extract the product SKU from the user request.
If the catalog cannot be confidently inferred, ask the user to clarify before calling this tool.
If the product cannot be clearly identified, ask a clarification question instead of guessing.`,
      _meta: {
        'openai/outputTemplate': 'ui://widget/item-detail.html',
        'openai/toolInvocation/invoking': 'Consultando detalle en Magento Cloud...',
        'openai/toolInvocation/invoked': 'Detalle cargado correctamente',
      },
      inputSchema: {
        catalog: z.enum(['b2b', 'b2c']).describe('El típo de catálogo a consultar: b2b o b2c'),
        sku: z.string().trim().describe('SKU del producto a consultar'),
      },
    },
    async ({ catalog, sku }: { catalog: 'b2b' | 'b2c', sku: number }) => {
      console.log('Joining telco-detail', catalog, sku);
      const ACCESS_TOKEN = process.env.PROVIDER_CARS_API_KEY;
      const catalogId = catalog === 'b2b' ? '29' : '28';

      if (!ACCESS_TOKEN) {
        console.error('ERROR: PROVIDER_CARS_API_KEY no está definida en el entorno.');
        return errorMessage('Error de configuración: Falta el Token de acceso.');
      }

      try {
        const GRAPHQL_URL = `https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/telco_${catalog}/graphql`;
        const gqlQuery = `query GetItem($category_id: String!, $sku: String!) {
          products(filter: { category_id: { eq: $category_id }, sku: { eq: $sku } }) {
            items {
              uid
              sku
              name
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
                disabled
                label
                position
                url
              }
              thumbnail {
                disabled
                label
                position
                url
              }
            }
          }
        }`;

        const gqlResponse = await fetch(GRAPHQL_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'Store': `telco_${catalog}`
          },
          body: JSON.stringify({
            query: gqlQuery,
            variables: { category_id: catalogId, sku: sku }
          })
        });

        const gqlResult = await gqlResponse.json() as { data?: { products?: { items: Product[] } } };
        const gqlItem = gqlResult.data?.products?.items?.[0];

        if (!gqlItem) {
          return {
            content: [{
              type: 'text' as const,
              text: `He encontrado 0 productos disponibles.`
            }],
          };
        }

        const item: Item = {
          uid: gqlItem.uid,
          sku: gqlItem.sku,
          name: gqlItem.name,
          price: gqlItem.price_range.minimum_price.regular_price?.value,
          description: gqlItem.descripcion,
          image: gqlItem.image,
          custom_attributes: []
        };

        return {
          content: [{
            type: 'text' as const,
            text: `He encontrado 1 producto disponible.`
          }],
          structuredContent: { item },
        };

      } catch (error) {
        console.error('Error fetching item catalog from Magento:', error);
        return errorMessage('Hubo un problema al conectar con el catálogo de Magento Cloud');
      }
    },
  );
}