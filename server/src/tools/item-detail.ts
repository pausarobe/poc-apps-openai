import { z } from 'zod';
import type { RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';

export function registerItemDetailTool(registerTool: RegisterToolFn) {
  registerTool(
    'item-detail',
    {
      title: 'Item Detail',
      description: 'Get the complete detail of a telco item from Magento Cloud',
      _meta: {
        'openai/outputTemplate': 'ui://widget/item-detail.html',
        'openai/toolInvocation/invoking': 'Consultando detalle de producto en Magento Cloud...',
        'openai/toolInvocation/invoked': 'Detalle del producto cargado correctamente',
      },
      inputSchema: {
        category: z.string().optional().describe('ID de categoría opcional (ej: 3, 5)'),
      },
    },
    async ({ category }: { category?: string }) => {
      const MAGENTO_BASE_URL = 'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/rest/V1';
      const ACCESS_TOKEN = process.env.PROVIDER_CARS_API_KEY;

      if (!ACCESS_TOKEN) {
        console.error('ERROR: PROVIDER_CARS_API_KEY no está definida en el entorno.');
        return errorMessage('Error de configuración: Falta el Token de acceso.');
      }

      // 2. Construcción de Search Criteria (Filtros obligatorios para Magento)
      // Filtramos por productos activos (status = 1)
      let query = 'searchCriteria[filter_groups][0][filters][0][field]=website_id&searchCriteria[filter_groups][0][filters][0][conditionType]=eq&searchCriteria[filterGroups][0][filters][0][value]=3';

      // Si el usuario pide una categoría, la añadimos
      if (category) {
        query += `&searchCriteria[filter_groups][1][filters][0][field]=website_id&searchCriteria[filter_groups][1][filters][0][value]=${category}`;
      }

      // Limitamos el tamaño de la página para el dashboard
      query += '&searchCriteria[pageSize]=10';

      const FINAL_URL = `${MAGENTO_BASE_URL}/products?${query}`;

      console.error('Invocando Magento Cloud en:', FINAL_URL);

      try {
        // 3. Llamada a la API con Bearer Token
        const response = await fetch(FINAL_URL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error Magento (${response.status}): ${errorText}`);
        }

        const data: any = await response.json();


        return {
          content: [{
            type: 'text' as const,
            text: `He encontrado ${data.items?.length || 0} productos disponibles.`
          }],
          structuredContent: { itemsList: data.items },
        };

      } catch (error) {
        console.error('Error fetching item detail from Magento:', error);
        return errorMessage('Hubo un problema al conectar con el catálogo de Magento Cloud');
      }
    },
  );
}