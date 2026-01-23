import { z } from 'zod';
import type { RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';

export function registerCreateCarTool(registerTool: RegisterToolFn) {
  registerTool(
    'create-car',
    {
      title: 'Gestionar Alta de Vehículo',
      description: 'Allows you to create a new car directly in the catalog or open the registration form.',
      _meta: {
        'openai/outputTemplate': 'ui://widget/car-create.html',
        'openai/toolInvocation/invoking': 'Procesando solicitud...',
        'openai/toolInvocation/invoked': 'Operación completada',
      },
      // Hacemos los campos opcionales para permitir la activación del formulario sin datos previos
      inputSchema: {
        name: z.string().nullish().describe('Nombre comercial del coche'),
        sku: z.string().nullish().describe('Referencia única SKU (ej: PROD-007)'),
        price: z.number().nullish().describe('Precio base del vehículo'),
        descripcion: z.string().nullish().describe('Descripción detallada del modelo'),
        cuota_renting: z.number().nullish().describe('Importe de la cuota mensual de renting'),
        kilometros_max: z.number().nullish().describe('Límite de kilómetros anuales incluidos'),
        tipo_motor: z.string().nullish().describe('Tipo de motor (Eléctrico, Híbrido, etc.)'),
        coste_seguro: z.number().nullish().describe('Importe mensual del seguro'),
        coste_mantenimiento: z.number().nullish().describe('Importe mensual de mantenimiento'),
        coste_reparaciones: z.number().nullish().describe('Importe mensual de reparaciones'),
      },
    },
    async (input) => {
      //Se reciben los datos? 
      console.log('--- DEBUG: DATOS RECIBIDOS DEL FORMULARIO ---');
      console.log(JSON.stringify(input, null, 2));

      const MAGENTO_BASE_URL = 'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/motores/rest/V1';
      const ACCESS_TOKEN = process.env.PROVIDER_CARS_API_KEY;

      if (!ACCESS_TOKEN) {
        console.error('--- ERROR: PROVIDER_CARS_API_KEY no está definido en el entorno ---');
        return errorMessage('Error de configuración: No se encontró el Token de Administrador.');
      }

      // Si faltan datos básicos, mostramos el formulario en el widget
      if (!input.name || !input.sku) {
        console.log('--- DEBUG: Faltan name o sku, abriendo formulario en el widget ---');
        return {
          content: [{ 
            type: 'text' as const, 
            text: 'Te he abierto el formulario de registro en el widget lateral para que introduzcas los datos del vehículo.' 
          }],
          structuredContent: { showForm: true }, // Señal que activará el estado 'form' en tu React
        };
      }

      // Mapeamos los datos al formato de Magento Cloud
      const productData = {
        product: {
          sku: input.sku,
          name: input.name,
          attribute_set_id: 15, // Set de atributos de Coches
          price: input.price || 0,
          status: 1, 
          visibility: 4, 
          type_id: "virtual",
          extension_attributes: {
            category_links: [{ position: 0, category_id: "24" }] // Categoría Motores
          },
          custom_attributes: [
            { attribute_code: 'descripcion', value: input.descripcion || "" },
            { attribute_code: 'cuota_renting', value: (input.cuota_renting || 0).toString() },
            { attribute_code: 'kilometros_max', value: (input.kilometros_max || 0).toString() },
            { attribute_code: 'tipo_motor', value: input.tipo_motor || "N/A" },
            { attribute_code: 'provider', value: "304" }, // NTT DATA
            { attribute_code: 'coste_seguro', value: (input.coste_seguro || 0).toString() },
            { attribute_code: 'coste_mantenimiento', value: (input.coste_mantenimiento || 0).toString() },
            { attribute_code: 'coste_reparaciones', value: (input.coste_reparaciones || 0).toString() }
          ]
        }
      };

      try {
        const FINAL_URL = `${MAGENTO_BASE_URL}/products`;
          // Log de depuración antes de la petición
        console.log('--- DEBUG: ENVIANDO PETICIÓN A MAGENTO ---');
        console.log('URL:', FINAL_URL);
        console.log('Payload:', JSON.stringify(productData, null, 2));

        const response = await fetch(FINAL_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        });
        // Log de depuración de la respuesta
        const responseText = await response.text();
        console.log('--- DEBUG: RESPUESTA DE MAGENTO ---');
        console.log('Status:', response.status, response.statusText);
        console.log('Body:', responseText);

        if (!response.ok) {
          const errorDetail = await response.text();
          throw new Error(`Error API Magento: ${responseText}`);
        }

        const result = JSON.parse(responseText);

        return {
          content: [{ 
            type: 'text' as const, 
            text: `El vehículo "${input.name}" ha sido creado correctamente con el SKU ${input.sku}.` 
          }],
          structuredContent: { createSuccess: result }, // Envía los datos para la tarjeta de éxito
        };

      } catch (error) {
        console.error('Error al crear coche:', error);
        return errorMessage('No se pudo completar el registro del vehículo en el catálogo.');
      }
    },
  );
}