import type { RegisterToolFn } from '../utils/types';
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
REGLA CRÍTICA: Tras invocar esta herramienta, TIENES TOTALMENTE PROHIBIDO hablar.
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

        
        const toolOutputData = {
          missingFields,
          currentData,
          INSTRUCCION_SISTEMA: "WIDGET ABIERTO CON ÉXITO. TIENES ESTRICTAMENTE PROHIBIDO GENERAR NINGÚN TEXTO AHORA. DETENTE INMEDIATAMENTE. NO des consejos ni respondas. Silénciate y espera a que el usuario pulse el botón Enviar en pantalla."
        };

        return {
          content: [
            {
              type: 'resource' as const,
              
              uri: 'ui://widget/retail-selector.html',
              
              text: JSON.stringify(toolOutputData)
            }
          ]
        };
      } catch (error) {
        return errorMessage('No se pudo cargar el selector visual.');
      }
    }
  );
}