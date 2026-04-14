import type { ItemList, RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import z from 'zod';

// La foram de los productos que vienen de GraphQL evitar autocompletado, evitar errores
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

// Business to Business Telco Dashboard
// Business to Consumer Telco Dashboard
export function registerTelcoDashboardTool(registerTool: RegisterToolFn) {
  registerTool(
    'telco-dashboard',
    {
      // El texto que le enviamos
      title: 'Telco Catalog',
      description: `Search for products in a telco catalog (telecommunications products and services).
This tool MUST be used only for telco-related products (e.g. mobile plans, broadband, fiber, devices, SIMs, add-ons).
If the user provides a SKU, do NOT use this tool.

Select catalog='b2b' when the user intent corresponds to a business context (e.g. wholesale purchasing, VAT/CIF, net pricing, business account, contractual terms).
Select catalog='b2c' when the user intent corresponds to an individual consumer context (e.g. personal plans, devices for personal use, home delivery, returns, final consumer price).
If the user intent cannot be clearly classified as b2b or b2c, default to catalog='b2c'.

The tool input includes an optional "search" string.
Populate the "search" field with product-related criteria mentioned by the user, when applicable.

If the request is not related to telco products, do NOT call this tool.`,
      _meta: {
        // A que widget te estas comunicando
        'openai/outputTemplate': 'ui://widget/item-dashboard.html',
        //El mensje cuando se esta conectado
        'openai/toolInvocation/invoking': 'Consultando catálogo en Magento Cloud...',
        // Cuando ya ha recibido la respuesta
        'openai/toolInvocation/invoked': 'Catálogo cargado correctamente',
      },
      inputSchema: {
        // Los valores que le puedes pasar al widget, el tipo de catalogo y el criterio de busqueda
        catalog: z.enum(['b2b', 'b2c']).describe('El típo de catálogo a consultar: b2b o b2c'),
        search: z.string().optional().describe('Criterio de búsqueda opcional, basado en la consulta del usuario'),
      }
    },
    async ({ catalog, search }: { catalog: 'b2b' | 'b2c', search?: string }) => {
      console.log('Joining telco-dashboard', catalog, search);
      // Variables de entorno que necesito para conectarme a Magento Cloud, el token de acceso y el id del catalogo dependiendo si es b2b o b2c
      // Las contraseñas nunca vandentro de codigo, se meten dentro de un fichero en el git ignore, de ahíes donde sacas esos tokens de acceso
      const ACCESS_TOKEN = process.env.PROVIDER_CARS_API_KEY;
      const catalogId = catalog === 'b2b' ? '29' : '28';

      if (!ACCESS_TOKEN) {
        console.error('ERROR: PROVIDER_CARS_API_KEY no está definida en el entorno.');
        return errorMessage('Error de configuración: Falta el Token de acceso.');
      }

      try {
        const GRAPHQL_URL = `https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/telco_${catalog}/graphql`;
        // Estructura de la consulta 
        const gqlQuery = `query GetItems($id: String!, $search: String) {
          products(
            search: $search,
            filter: { category_id: { eq: $id } }
          ) {
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

        // Peticion http al servidor, le dices el catalago que quieres de telco, lo guardo en gqlResponse
        const gqlResponse = await fetch(GRAPHQL_URL, {
          method: 'POST',
          headers: {
            // Definimos contexto de tienda en la cabecera para que Magento Cloud sepa a qué catálogo queremos acceder
            'Content-Type': 'application/json',
            'Store': `telco_${catalog}`
          },
          body: JSON.stringify({
            query: gqlQuery,
            variables: { id: catalogId, search }
          })
        });
        // Pillamos la respuesta y la guardamos aquí, lo guardamos en Json
        const gqlResult = await gqlResponse.json() as { data?: { products?: { items: Product[] }, __type?: { fields: any[] } }, errors?: { message: string }[] };

        // Manejo de errores
        if (gqlResult?.errors && gqlResult.errors.length > 0) {
          console.error('GraphQL Errors:', gqlResult.errors);
          throw new Error();
        }
        // Extraemos los items de la respuesta, si no hay items devolvemos un array vacío
        const gqlItems = gqlResult.data?.products?.items || [];

        // Transformamos los items cen ItemList con un .map
        const itemList: ItemList = gqlItems.map((item) => ({
          uid: item.uid,
          sku: item.sku,
          name: item.name,
          price: item.price_range.minimum_price.regular_price.value,
          description: item.descripcion,
          image: item.image,
          custom_attributes: []
        }));

        return {
          // Lo que le digo al chatGPT que me muestre en el widget, el número de productos encontrados
          content: [{
            type: 'text' as const,
            text: `He encontrado ${itemList.length ?? 0} productos disponibles.`
          }],
          // Datos que utilzo en el widget
          structuredContent: { itemList, category: `telco_${catalog}` },
        };

      } catch (error) {
        console.error('Error fetching item catalog from Magento:', error);
        return errorMessage('Hubo un problema al conectar con el catálogo de Magento Cloud');
      }
    },
  );
}