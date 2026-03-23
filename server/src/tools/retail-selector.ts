import type { RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import z from 'zod';

export function registerRetailSelectorTool(registerTool: RegisterToolFn) {
  registerTool(
    'retail-selector',
    {
      title: 'Retail Filter Selector Widget',
      description: `
ESTA HERRAMIENTA ABRE UN SELECTOR VISUAL AL USUARIO.
Úsala OBLIGATORIAMENTE cuando falte 'genero', 'tiempo' o 'ocasion'.

 REGLA DE ORO INQUEBRANTABLE 
Cuando uses esta herramienta, TIENES PROHIBIDO inventar looks o dar ideas. 
Tu única respuesta de texto al usuario DEBE SER EXACTAMENTE ESTA FRASE: 
"Por favor, selecciona las opciones en el recuadro."
No añadas ni una sola palabra más. Detente inmediatamente.
`,
      _meta: {
        'openai/outputTemplate': 'ui://widget/retail-selector.html',
        'openai/toolInvocation/invoking': 'Abriendo selector visual...',
        'openai/toolInvocation/invoked': 'Selector abierto',
      },
      inputSchema: {
        missingFields: z.array(z.enum(['genero', 'tiempo', 'ocasion']))
          .describe('Lista de campos que FALTAN. Si el usuario menciona "boda", "fiesta", o "deporte", NO lo metas aquí, ya tienes la ocasión.'),
        currentData: z.object({
          genero: z.string().optional(),
          tiempo: z.string().optional(),
          ocasion: z.string().optional(),
        }).optional().describe('Datos que YA conoces.')
      }
    },
    async ({ missingFields, currentData }: { missingFields: string[], currentData?: any }) => {
      try {
        console.log(`\n[WIDGET] Abriendo selector. Faltan: ${missingFields.join(', ')}`);

       
        const toolOutputData = {
          missingFields: missingFields,
          currentData: currentData
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