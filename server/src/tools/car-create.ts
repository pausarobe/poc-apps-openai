import { z } from 'zod';
import type { RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';

export function registerCreateCarTool(registerTool: RegisterToolFn) {
  registerTool(
    'create-car',
    {
      title: 'Gestionar Alta de Vehículo',
      description: 'Allows you to open the registration form or add a vehicle directly to the catalog.',
      _meta: {
        'openai/outputTemplate': 'ui://widget/car-create-success.html',
        'openai/toolInvocation/invoking': 'Procesando solicitud...',
        'openai/toolInvocation/invoked': 'Operación completada',
      },
      // Hacemos los campos opcionales para permitir la activación del formulario sin datos previos
      inputSchema: {
        name: z.string().optional().describe('Nombre comercial del coche'),
        sku: z.string().optional().describe('Referencia única SKU (ej: PROD-007)'),
        price: z.number().optional().describe('Precio base del vehículo'),
        descripcion: z.string().optional().describe('Descripción detallada del modelo'),
        cuota_renting: z.number().optional().describe('Importe de la cuota mensual de renting'),
        kilometros_max: z.number().optional().describe('Límite de kilómetros anuales incluidos'),
        tipo_motor: z.string().optional().describe('Tipo de motor (Eléctrico, Híbrido, etc.)'),
        coste_seguro: z.number().optional().describe('Importe mensual del seguro'),
        coste_mantenimiento: z.number().optional().describe('Importe mensual de mantenimiento'),
        coste_reparaciones: z.number().optional().describe('Importe mensual de reparaciones'),
      },
    },
    async (input) => {
      const MAGENTO_BASE_URL = 'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/motores/rest/V1';
      const ACCESS_TOKEN = process.env.PROVIDER_CARS_API_KEY;

      if (!ACCESS_TOKEN) {
        return errorMessage('Error de configuración: No se encontró el Token de Administrador.');
      }

      // Si faltan datos básicos, mostramos el formulario en el widget
      if (!input.name || !input.sku) {
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
        console.error('Iniciando creación de producto:', input.sku);

        const response = await fetch(FINAL_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        });

        if (!response.ok) {
          const errorDetail = await response.text();
          throw new Error(`Error API Magento: ${errorDetail}`);
        }

        const result = await response.json();

        return {
          content: [{ 
            type: 'text' as const, 
            text: `✅ El vehículo "${input.name}" ha sido creado correctamente con el SKU ${input.sku}.` 
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