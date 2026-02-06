import type { ItemList, RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import z from 'zod';

type Product = {
  id: number;
  sku: string;
  name: string;
  status: number;
  price: number;
  description: string;
  media_gallery_entries?: Array<{
    id: number;
    media_type: 'image';
    label: string | null;
    position: number;
    disabled: boolean;
    types: ("image" | "small_image" | "thumbnail")[];
    file: string;
  }>;
  custom_attributes?: Array<{
    attribute_code: string;
    value: string | null;
  }>;
};

// Business to Business Telco Dashboard
// Business to Consumer Telco Dashboard
export function registerTelcoDashboardTool(registerTool: RegisterToolFn) {
  registerTool(
    'telco-dashboard',
    {
      title: 'Telco Catalog',
      description: `Search for products in a telco catalog (telecommunications products and services).
This tool MUST be used only for telco-related products (e.g. mobile plans, broadband, fiber, devices, SIMs, add-ons).

Select catalog='b2b' when the user intent corresponds to a business context (e.g. wholesale purchasing, VAT/CIF, net pricing, business account, contractual terms).
Select catalog='b2c' when the user intent corresponds to an individual consumer context (e.g. personal plans, devices for personal use, home delivery, returns, final consumer price).

The tool input includes an optional "search" string.
Populate the "search" field with product-related criteria mentioned by the user, when applicable.

If the request is not related to telco products, do NOT call this tool.
`,
// If the catalog cannot be confidently inferred from the request, ask the user to clarify or fall back to the configured default.
// Do NOT invent or assume a "search" value if it is not explicitly implied by the user request.
      _meta: {
        'openai/outputTemplate': 'ui://widget/item-dashboard.html',
        'openai/toolInvocation/invoking': 'Consultando catálogo en Magento Cloud...',
        'openai/toolInvocation/invoked': 'Catálogo cargado correctamente',
      },
      inputSchema: {
        catalog: z.enum(['b2b', 'b2c']).describe('El típo de catálogo a consultar: b2b o b2c'),
        search: z.string().optional().describe('Criterio de búsqueda opcional, basado en la consulta del usuario'),
      }
    },
    async ({ catalog, search }: { catalog: 'b2b' | 'b2c', search?: string }) => {
      const ACCESS_TOKEN = process.env.PROVIDER_CARS_API_KEY;
      const catalogId = catalog === 'b2b' ? '29' : '28';

      if (!ACCESS_TOKEN) {
        console.error('ERROR: PROVIDER_CARS_API_KEY no está definida en el entorno.');
        return errorMessage('Error de configuración: Falta el Token de acceso.');
      }

      try {
        const GRAPHQL_URL = `https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/telco_${catalog}/graphql`;
        const gqlQuery = `query GetItems($id: String!, $search: String) {
          products(
            search: $search,
            filter: { category_id: { eq: $id } }
          ) {
            items {
              id
              sku
              name
              descripcion
              kilometros_max
              tipo_motor
              coste_seguro
              coste_mantenimiento
              coste_reparaciones
              provider
              price_range {
                minimum_price {
                  final_price { value }
                }
              }
              media_gallery { url label position }
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
            variables: { id: catalogId, search }
          })
        });

        const gqlResult = await gqlResponse.json() as { data?: { products?: { items: Product[] } } };
        const gqlItems = gqlResult.data?.products?.items || [];

        const itemList: ItemList = gqlItems.map((item) => ({
          id: item.id,
          sku: item.sku,
          name: item.name,
          status: item.status,
          price: item.price,
          description: item.custom_attributes?.find(attr => attr.attribute_code === 'description')?.value ?? undefined,
          media_gallery_entries: item.media_gallery_entries?.map(img => ({
            id: img.id,
            media_type: img.media_type,
            label: img.label ?? undefined,
            position: img.position,
            disabled: img.disabled,
            types: img.types,
            file: img.file,
          })),
          custom_attributes: []
        }));

        return {
          content: [{
            type: 'text' as const,
            text: `He encontrado ${itemList.length ?? 0} productos disponibles.`
          }],
          structuredContent: { itemList },
        };

      } catch (error) {
        console.error('Error fetching item catalog from Magento:', error);
        return errorMessage('Hubo un problema al conectar con el catálogo de Magento Cloud');
      }
    },
  );
}