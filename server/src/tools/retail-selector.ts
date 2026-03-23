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

REGLA CRÍTICA DE COMPORTAMIENTO: Tras llamar a esta herramienta, TIENES TOTALMENTE PROHIBIDO generar ninguna respuesta de texto. No ofrezcas opciones, no des consejos, no hables. Solo usa la herramienta y detente.
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
        console.log(`\n[WIDGET] Abriendo selector. Faltan: ${missingFields.join(', ')}`);

        
        const toolOutputData = {
          missingFields: missingFields,
          currentData: currentData,
          INSTRUCCION_SISTEMA: " La interfaz visual se ha mostrado al usuario. TIENES ESTRICTAMENTE PROHIBIDO responder con texto, dar consejos o preguntar opciones. DEBES QUEDARTE EN SILENCIO ABSOLUTO hasta que el usuario pulse el botón Enviar."
        };

        return {
          content: [
            {
              type: 'text' as const,
             
              text: JSON.stringify(toolOutputData)
            },
            {
              type: 'resource' as const,
              uri: 'ui://widget/retail-selector.html'
            }
          ]
        };
      } catch (error) {
        return errorMessage('No se pudo cargar el selector visual.');
      }
    }
  );
}