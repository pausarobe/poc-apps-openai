import { z } from 'zod';
import type { RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';

export function registerCarDetailTool(registerTool: RegisterToolFn) {
  registerTool(
    'car-detail',
    {
      title: 'Car Detail',
      description: 'Get the technical details and rental costs of a car using its SKU',
      _meta: {
        'openai/outputTemplate': 'ui://widget/car-detail.html',
        'openai/toolInvocation/invoking': 'Consultando catálogo en tiempo real...',
        'openai/toolInvocation/invoked': 'Ficha técnica actualizada',
      },
      inputSchema: {
        sku: z.string().describe('El código SKU del coche (ej: PROD-001)'),
      },
    },
    async ({ sku }: { sku: string }) => {
      const API_URL = `https://api.tu-servicio-renting.com/v1/cars?sku=${sku}&api_key=${process.env.PROVIDER_CARS_API_KEY}`;

      console.error('Invocando API de coches para SKU:', sku);

      if (!sku) {
        return errorMessage('No se proporcionó el SKU del vehículo');
      }

      try {
        // Llamada real a la API
        console.log('Fetching car detail from API:', API_URL);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`Error en la API: ${response.statusText}`);
        }

        const data: any = await response.json();
        
        // Asumimos que la API devuelve un objeto o un array de items
        const car = data?.items?.[0] || data; 

        if (!car || (car.sku !== sku && !data.id)) {
          return errorMessage(`No se encontró información para el vehículo con SKU: ${sku}`);
        }

        // Devolvemos la data estructurada para el Resource
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