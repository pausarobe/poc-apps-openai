import type { Item, ItemList, LookList, RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import z from 'zod';
export function registerCatalogDiscoveryTool(registerTool: RegisterToolFn) {
  registerTool(
    'catalog-discovery',
    {
      title: 'Catalog Data Discovery',
      description: `
GENERAL FASHION SEARCH, DISCOVERY AND STYLE ASSISTANT.
HERRAMIENTA PRIVADA (INVISIBLE PARA EL USUARIO). 
ÚSALA SIEMPRE COMO EL PRIMER PASO para buscar en la base de datos de Magento.

It can be triggered by:
- Explicit filters such as gender, weather, or occasion.
- General or open-ended fashion questions (e.g., "What should I wear to a wedding?").
- Situations where the user describes an event, context, or need.

The tool should interpret the user’s intent and return a JSON. Analiza ese JSON internamente, elige los mejores SKUs y luego llama a 'retail-dashboard' para mostrarlos.
`,
      _meta: {
        // Al NO tener "openai/outputTemplate", el sistema no reserva espacio visual.
        'openai/toolInvocation/invoking': 'Analizando disponibilidad...',
        'openai/toolInvocation/invoked': 'Datos analizados',
      },
      inputSchema: {
        catalog: z.enum(['looks', 'items']).default('looks').describe('Tipo de catálogo: looks o items'),
        genero: z.enum(['hombre', 'mujer', 'unisex', 'kids']).optional().describe('Género para filtrar la búsqueda inicial'),
        // tiempo: z.enum(['frio', 'calido', 'lluvia', 'templado']).optional().describe('Clima/Tiempo: "frio" para clima frío/invierno, "calido" para clima cálido/verano, "lluvia" para clima lluvioso, "templado" para entretiempo'),
        ocasion: z.enum(['boda', 'oficina', 'fiesta', 'deporte', 'diario']).optional().describe('Ocasión: "boda" para eventos formales, "oficina" para trabajo, "fiesta" para celebraciones, "deporte" para actividad física, "diario" para uso casual'),

      }
    },
    async ({ catalog, genero, ocasion }: { catalog: 'looks' | 'items', genero?: string, ocasion?: string }) => {
      const ACCESS_TOKEN = process.env.PROVIDER_CARS_API_KEY;
      const catalogId = catalog === 'looks' ? '47' : '48';
      const generoMap: Record<string, string> = { 'hombre': '112', 'mujer': '113', 'unisex': '114', 'kids': '115' };
      const generoId = genero ? generoMap[genero] : "";
      const ocasionMap: Record<string, string> = {
        'boda': '103',
        'oficina': '104',
        'fiesta': '105',
        'deporte': '106',
        'diario': '107'
      };
      const ocasionId = ocasion ? ocasionMap[ocasion] : "";

      try {
        const GRAPHQL_URL = `https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/graphql`;

        // Query simplificada: Solo pedimos lo necesario para que la IA "entienda" los productos
        const gqlQuery = `query GetItems($id: String!, $genero: String, $ocasion: String) {
          products(filter: { category_id: { eq: $id }, genero: { eq: $genero }, ocasion: { eq: $ocasion } }) {
            items {
              sku
              name
              descripcionIA
              descripcion
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
            variables: {
              id: catalogId,
              genero: generoId,
              //tiempo: tiempoId, 
              ocasion: ocasionId
            }
          })
        });

        const gqlResult = await gqlResponse.json() as any;
        const items = gqlResult.data?.products?.items || [];

        // Devolvemos los datos como texto plano para que la IA los lea
        return {
          content: [{
            type: 'text' as const,
            text: `[CATALOG_DATA]: ${JSON.stringify(items)}`
          }]
        };

      } catch (error) {
        return errorMessage('Error en el descubrimiento de datos.');
      }
    }
  );
}