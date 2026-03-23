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
REGLAS CRÍTICAS Y ABSOLUTAS:
1. Al invocar esta herramienta, TIENES TOTALMENTE PROHIBIDO generar texto. No digas "Claro, aquí tienes looks...", no des consejos.
2. TIENES TOTALMENTE PROHIBIDO inventar looks de tu propia memoria. No tienes los datos de Magento todavía.
3. TU ÚNICA ACCIÓN es llamar a esta herramienta y SILENCIARTE INMEDIATAMENTE. El sistema espera que el usuario interactúe con la pantalla.
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
          _DIRECTIVA_DE_SISTEMA: "ÉXITO: El widget visual se ha mostrado. DETENTE AHORA MISMO. NO generes NINGÚN texto de respuesta. NO inventes productos de ropa. Cede el turno inmediatamente al usuario para que envíe el formulario."
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