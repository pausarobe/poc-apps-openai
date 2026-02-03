import { z } from 'zod';
import type { RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import {carsData} from '../mock/cars.mock.js';

export function registerCarDashboardTool(registerTool: RegisterToolFn) {
  registerTool(
    'car-dashboard',
    {
      title: 'Car Catalog',
      description: 'Get the complete catalog of available rental vehicles from Magento Cloud',
      _meta: {
        'openai/outputTemplate': 'ui://widget/car-dashboard.html',
        'openai/toolInvocation/invoking': 'Consultando catálogo en Magento Cloud...',
        'openai/toolInvocation/invoked': 'Catálogo cargado correctamente',
        'openai/view/preference': 'expanded',
      },
      inputSchema: {
        category: z.string().optional().describe('ID de categoría opcional (ej: 3, 5)'),
      },
    },
    async ({ category }: { category?: string }) => {
      /*
      const MAGENTO_BASE_URL = 'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/motores/rest/V1';
      const ACCESS_TOKEN = process.env.PROVIDER_CARS_API_KEY; 

      if (!ACCESS_TOKEN) {
        console.error('ERROR: PROVIDER_CARS_API_KEY no está definida en el entorno.');
        return errorMessage('Error de configuración: Falta el Token de acceso.');
      }

      // 2. Construcción de Search Criteria (Filtros obligatorios para Magento)
      // Filtramos por productos activos (status = 1)
      let query = 'searchCriteria[filter_groups][0][filters][0][field]=category_id&searchCriteria[filter_groups][0][filters][0][value]=24';
      
      // Si el usuario pide una categoría, la añadimos
      if (category) {
        query += `&searchCriteria[filter_groups][1][filters][0][field]=category_id&searchCriteria[filter_groups][1][filters][0][value]=${category}`;
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
        */
      try {
        console.log('--- LEYENDO DATOS DESDE mock/cars.json ---');
        const items = (carsData as any).items || carsData;
       
        /* =========================================================================
        OPCIÓN B: QUERY GRAPHQL (COMENTADA Y LISTA PARA USAR)
        =========================================================================
        En lugar de traer todos los datos del producto y luego buscar dentro, le pedimos a Magento solo los campos que necesitamos (como cuota_renting, kilometros_max o tipo_motor).
        Usamos la cabecera 'Store': 'motores' para obligar a Magento a mirar en la base de datos correcta (Motor ES), que es donde están cargados tus 11 coches.
        Como GraphQL devuelve los datos "planos" y tu interfaz CarData los espera en "listas" (arrays de custom_attributes y media_gallery), 
        el código realiza una conversión automática. 
        Esto permite que el resto de tu aplicación siga funcionando igual de bien, pero con datos cargados de forma más eficiente.

        CÓDIGO DE IMPLEMENTACIÓN:

        const GRAPHQL_URL = 'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/motores/graphql';
        const gqlQuery = `query GetCars($id: String!) {
          products(filter: { category_id: { eq: $id } }) {
            items {
              id 
              sku 
              name 
              descripcion 
              cuota_renting 
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
            'Store': 'motores' // Imprescindible para ver los datos
          },
          body: JSON.stringify({ 
            query: gqlQuery, 
            variables: { id: category || "24" } 
          })
        });

        const gqlResult = await gqlResponse.json();
        const gqlItems = gqlResult.data?.products?.items || [];

        // MAPEADOR PARA CAR DATA:
        const carList = gqlItems.map((item: any) => ({
          id: item.id,
          sku: item.sku,
          name: item.name,
          status: 1,
          price: item.price_range?.minimum_price?.final_price?.value || 0,
          media_gallery_entries: (item.media_gallery || []).map((img: any, i: number) => ({
            id: i + 100,
            media_type: 'image',
            label: img.label,
            position: img.position,
            disabled: false,
            types: i === 0 ? ['image', 'small_image', 'thumbnail'] : [],
            file: img.url
          })),
          custom_attributes: [
            { attribute_code: 'cuota_renting', value: item.cuota_renting },
            { attribute_code: 'kilometros_max', value: item.kilometros_max },
            { attribute_code: 'tipo_motor', value: item.tipo_motor },
            { attribute_code: 'descripcion', value: item.descripcion }
          ]
        }));
        =========================================================================
        */

        
        console.error(`Se han obtenido ${items.length} vehículos desde Magento Cloud.`);
        return {
          content: [{ 
            type: 'text' as const, 
            text: `He encontrado ${items.length} vehículos disponibles en la vista de Motores.` 
          }],
          structuredContent: { carList: items },
        };

      } catch (error) {
        console.error('Error fetching car catalog from Magento:', error);
        return errorMessage('Hubo un problema al conectar con el catálogo de Magento Cloud');
      }
    },
  );
}