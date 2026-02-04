import { z } from 'zod';
import type { RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import { carsData } from '../mock/cars.mock.js';

export function registerCarDetailTool(registerTool: RegisterToolFn) {
  registerTool(
    'car-detail',
    {
      title: 'Car Detail',
      description: 'Get the technical details and rental costs of a car using its SKU',
      _meta: {
        ui: {
          resourceUri: 'ui://widget/car-detail.html'
        }
      },
      inputSchema: {
        sku: z.string().describe('El código SKU del coche (ej: PROD-001)'),
      },
    },
    async ({ sku }: { sku: string }) => {
      /*
      // Mantenemos tu URL de Magento Cloud y tu variable de entorno
      const MAGENTO_BASE_URL = 'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/motores/rest/V1';
      const ACCESS_TOKEN = process.env.PROVIDER_CARS_API_KEY;

      if (!sku) {
        return errorMessage('No se proporcionó el SKU del vehículo');
      }

      try {
        // La URL de Magento para un producto específico
        const FINAL_URL = `${MAGENTO_BASE_URL}/products/${encodeURIComponent(sku)}`;
        console.error('Invocando Detalle en Magento Cloud para SKU:', sku);

        const response = await fetch(FINAL_URL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`, // Tu Token de siempre
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Error en la API: ${response.statusText}`);
        }

        const data: any = await response.json();
        */
       
      try {
        console.log('--- LEYENDO DETALLE DESDE mock/cars.json ---');
        const items = (carsData as any).items || carsData;
        const car = items.find((car: any) => car.sku === sku);

        // Mantenemos tu lógica de extracción: el objeto directo o el primer item
        //const car = data?.items?.[0] || data;

        if (!car)    {
          return errorMessage(`No se encontró información para el vehículo con SKU: ${sku}`);
        }

        // Devolvemos EXACTAMENTE lo mismo que antes para que tu widget no rompa
        return {
          content: [{ 
            type: 'text' as const, 
            text: `He obtenido los datos actualizados desde la API para el ${car.name}.` 
          }],
          structuredContent: { carDetail: car },
        };

      } catch (error) {
        console.error('Error fetching car from API:', error);
        return errorMessage('Hubo un problema al conectar con el servicio de catálogo de coches');
      }
    },
  );
}