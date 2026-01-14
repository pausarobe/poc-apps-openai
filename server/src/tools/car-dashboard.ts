import { z } from 'zod';
import type { RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';

export function registerCarDashboardTool(registerTool: RegisterToolFn) {
  registerTool(
    'car-dashboard',
    {
      title: 'Car Catalog',
      description: 'Get the complete catalog of available rental vehicles',
      _meta: {
        'openai/outputTemplate': 'ui://widget/car-dashboard.html',
        'openai/toolInvocation/invoking': 'Consultando catálogo en tiempo real...',
        'openai/toolInvocation/invoked': 'Catálogo cargado desde la API',
      },
      inputSchema: {
        category: z.string().optional().describe('Categoría opcional para filtrar (ej: Eléctrico, Híbrido)'),
      },
    },
    async ({ category }: { category?: string }) => {
      let API_URL = `https://api.tu-servicio-renting.com/v1/cars?api_key=${process.env.PROVIDER_CARS_API_KEY}`;
      
      if (category) {
        API_URL += `&category=${encodeURIComponent(category)}`;
      }

      console.error('Invocando API de catálogo para categoría:', category || 'Todas');
      console.error('Fetching car catalog from API:', API_URL);
      try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`Error en la API: ${response.statusText}`);
        }

        const data: any = await response.json();
        
        // 3. Extracción de los items (asumiendo estructura 'items' o array directo)
        const items = data?.items || (Array.isArray(data) ? data : []);

        // 4. Devolvemos la data estructurada para el componente car-components.tsx
        return {
          content: [{ 
            type: 'text' as const, 
            text: `He encontrado ${items.length} vehículos disponibles en el catálogo en tiempo real.` 
          }],
          structuredContent: { carList: items },
        };

      } catch (error) {
        console.error('Error fetching car catalog from API:', error);
        return errorMessage('Hubo un problema al conectar con el servicio de catálogo de coches');
      }
    },
  );
}