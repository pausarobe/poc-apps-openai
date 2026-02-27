import type { Item, ItemList, LookList, RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import z from 'zod';

type LookProduct = {
  uid: string;
  id: number;
  descripcionIA?: string;
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
      description: `
      
GENERAL FASHION SEARCH AND STYLE ASSISTANT.

Use this tool to generate and display lists of clothing, outfits, or complete looks.
It can be triggered by:
- Explicit filters such as gender (men, women), weather (cold, warm), or occasion (party, wedding).
- General or open-ended fashion questions (e.g., "What should I wear to a wedding?", "I have a party tomorrow, any outfit ideas?", "How should I dress for cold weather?").
- Situations where the user describes an event, context, or need without specifying filters directly.

The tool should interpret the user’s intent (occasion, weather, dress code, time of day, etc.) even if not explicitly structured as filters.

CRITICAL RULE:
DO NOT USE this tool if the user mentions a specific SKU code (e.g., LOOK-123, SKU-001)
or asks to see the details of an item that is already on screen.
In those cases, DO NOT CALL the tool; simply describe the product using the information already provided.
`,
      _meta: {
        'openai/outputTemplate': 'ui://widget/item-dashboard.html',
        'openai/toolInvocation/invoking': 'Filtrando el catálogo según tus preferencias...',
        'openai/toolInvocation/invoked': 'Catálogo de moda cargado',
      },
      inputSchema: {
        catalog: z.enum(['looks', 'items']).default('looks').describe('El tipo de catálogo: looks (conjuntos) o items (prendas sueltas)'),
        genero: z.enum(['hombre', 'mujer', 'unisex', 'kids']).optional().describe('Género del producto: "hombre" para ropa de hombre, "mujer" para ropa de mujer, "unisex" para ropa sin género específico, "kids" para niños'),
        orderedSkus: z.array(z.string()).optional().describe('Lista de SKUs en el orden exacto en que deben mostrarse visualmente.'),
        // tiempo: z.enum(['frio', 'calido', 'lluvia', 'templado']).optional().describe('Clima/Tiempo: "frio" para clima frío/invierno, "calido" para clima cálido/verano, "lluvia" para clima lluvioso, "templado" para entretiempo'),
        ocasion: z.enum(['boda', 'oficina', 'fiesta', 'deporte', 'diario']).optional().describe('Ocasión: "boda" para eventos formales, "oficina" para trabajo, "fiesta" para celebraciones, "deporte" para actividad física, "diario" para uso casual'),
      }
    },
    async ({ catalog, genero, tiempo, ocasion, orderedSkus }: { catalog: 'looks' | 'items', genero?: 'hombre' | 'mujer' | 'unisex' | 'kids', tiempo?: 'frio' | 'calido' | 'lluvia' | 'templado', ocasion?: 'boda' | 'oficina' | 'fiesta' | 'deporte' | 'diario', orderedSkus?: string[] }) => {
      console.log('Joining retail-dashboard', catalog, genero, tiempo, ocasion, orderedSkus);
      const ACCESS_TOKEN = process.env.PROVIDER_CARS_API_KEY;
      const catalogId = catalog === 'looks' ? '47' : '48';

      // Mapeo de género a ID numérico
      const generoMap: Record<string, string> = {
        'hombre': '112',
        'mujer': '113',
        'unisex': '114',
        'kids': '115'
      };
      const generoId = genero ? generoMap[genero] : "";

      // Mapeo de tiempo a ID numérico
      const tiempoMap: Record<string, string> = {
        'frio': '99',
        'calido': '100',
        'lluvia': '101',
        'templado': '102'
      };
      const tiempoId = tiempo ? tiempoMap[tiempo] : "";

      // Mapeo de ocasion a ID numérico
      const ocasionMap: Record<string, string> = {
        'boda': '103',
        'oficina': '104',
        'fiesta': '105',
        'deporte': '106',
        'diario': '107'
      };
      const ocasionId = ocasion ? ocasionMap[ocasion] : "";

      if (!ACCESS_TOKEN) {
        console.error('ERROR: PROVIDER_CARS_API_KEY no está definida.');
        return errorMessage('Error de configuración: Falta el Token.');
      }

      try {
        const GRAPHQL_URL = `https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/graphql`;
        const gqlQuery = `query GetItems($id: String!, $genero: String, $ocasion: String) {
  products(
    filter: { 
      category_id: { eq: $id },
      genero: { eq: $genero },
      ocasion: { eq: $ocasion },
      
    }
  ) {
    items {
      uid
      id
      sku
      name
      genero
      tiempo
      ocasion
      descripcionIA
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
        console.error('GraphQL REQUEST:', { id: catalogId, genero: generoId, tiempo: tiempoId, ocasion: ocasionId });

        const gqlResponse = await fetch(GRAPHQL_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Store': catalog === 'looks' ? 'Looks' : 'items',
            'Authorization': `Bearer ${ACCESS_TOKEN}`
          },
          body: JSON.stringify({
            query: gqlQuery,
            variables: {
              id: catalogId,
              genero: generoId,
              //tiempo: tiempoId, 
              ocasion: ocasionId
            }
          })
        });

        console.error('GraphQL Response Status:', gqlResponse.status, gqlResponse.statusText);

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

        const allMaps = { ...generoMap, ...tiempoMap, ...ocasionMap };
        const reverseMap = Object.fromEntries(Object.entries(allMaps).map(([k, v]) => [v, k]));
        const getTags = (item: any) => [item.genero, item.tiempo, item.ocasion].filter(val => val !== undefined && val !== null && val !== "")
          .map(val => reverseMap[String(val)] || String(val));
        let itemList: Item[] = gqlItems.map((item: any) => ({
          uid: item.uid,
          name: item.name,
          id: item.id,
          sku: item.sku,
          image: item.image,
          thumbnail: item.thumbnail,
          price: item.price_range?.minimum_price?.regular_price?.value ?? 0,

          properties: {
            ai_recommendation_hint: item.descripcionIA || item.descripcion || "",
            full_description: item.descripcion || ""
          },

          product_links: [],
          custom_attributes: [],
          visibleTags: getTags(item)

        }));

        if (orderedSkus && orderedSkus.length > 0) {
          itemList = orderedSkus.map(sku => itemList.find(item => item.sku === sku))
            .filter((item): item is Item => !!item);
        }
        return {
          content: [{
            type: 'text' as const,
            text: orderedSkus
              ? `He organizado visualmente los productos siguiendo el orden de relevancia que has decidido.`
              : `He recuperado ${itemList.length} opciones. Analiza estos datos y vuelve a llamarme con 'orderedSkus' 
                para ordenarlos:\n${JSON.stringify(itemList)}`

          }],
          ...(orderedSkus ? {
            structuredContent: { itemList, category: `retail_${catalog}` }
          } : {}),
        };

      } catch (error) {
        console.error('Error fetching retail catalog:', error);
        return errorMessage('Hubo un problema al conectar con el catálogo de moda.');
      }
    },
  );
}