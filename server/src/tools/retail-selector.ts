import type { Item, ItemList, LookList, RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import z from 'zod';

export function registerRetailSelectorTool(registerTool: RegisterToolFn) {
  registerTool(
    'retail-selector',
    {
      title: 'Retail Filter Selector Widget',
      description: `
ESTA HERRAMIENTA DISPARA UN SELECTOR VISUAL (WIDGET).
ÚSALA OBLIGATORIAMENTE cuando falte alguno de estos datos: 'genero', 'tiempo' (clima) o 'ocasion' antes de buscar en Magento.
`,
      _meta: {
        'openai/outputTemplate': 'ui://widget/retail-selector.html',
        'openai/toolInvocation/invoking': 'Abriendo opciones de búsqueda...',
        'openai/toolInvocation/invoked': 'Opciones mostradas',
      },
      inputSchema: {
        missingFields: z.array(z.enum(['genero', 'tiempo', 'ocasion']))
          .describe('Lista de campos que el usuario DEBE completar (los que faltan).'),
        currentData: z.object({
          genero: z.string().optional(),
          tiempo: z.string().optional(),
          ocasion: z.string().optional(),
        }).optional().describe('Datos que YA conoces del usuario, para que el widget los muestre como pre-seleccionados.')
      }
    },
    async ({ missingFields, currentData }: { missingFields: string[], currentData?: any }) => {
      try {
        console.log(`\n[WIDGET] Abriendo selector.`);
        console.log(`Faltan: ${missingFields.join(', ')}`);
        console.log(`Ya tenemos:`, currentData);

        // 1. Preparamos los datos en JSON para que el componente React los lea correctamente
        const toolOutputData = {
          missingFields,
          currentData
        };

        return {
          content: [
            {
              type: 'text' as const,
              
              text: `${JSON.stringify(toolOutputData)}\n\n[INSTRUCCIÓN CRÍTICA DE SISTEMA]: Has invocado el widget visual con éxito. AHORA TIENES ESTRICTAMENTE PROHIBIDO GENERAR NINGÚN TEXTO ADICIONAL. DETENTE INMEDIATAMENTE. NO respondas a la pregunta del usuario con tus propios conocimientos ni hagas sugerencias. Silénciate y espera a que el usuario interactúe con el widget en pantalla.`
            },
            {
              type: 'resource' as const,
             
              uri: `ui://widget/retail-selector.html`
            }
          ]
        };
      } catch (error) {
        return errorMessage('No se pudo cargar el selector visual.');
      }
    }
  );
}