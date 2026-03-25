import type { RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import z from 'zod';

export function registerRetailSelectorTool(registerTool: RegisterToolFn) {
  registerTool(
    'retail-selector',
    {
      title: 'Retail Filter Selector Widget',
      description: `
ESTA HERRAMIENTA MUESTRA UN SELECTOR VISUAL AL USUARIO.
Úsala OBLIGATORIAMENTE cuando falte 'genero', 'tiempo' o 'ocasion'.

INSTRUCCIÓN DE SISTEMA CRÍTICA 
Para no romper la interfaz visual, al usar esta herramienta TU ÚNICA RESPUESTA debe ser EXACTAMENTE esta frase: 
"Por favor, completa las opciones en el recuadro de arriba para poder buscar tu ropa en el catálogo." 
NO INVENTES LOOKS. NO DES CONSEJOS. SOLO DI ESA FRASE Y DETENTE.
`,
      _meta: {
        'openai/outputTemplate': 'ui://widget/retail-selector.html',
        'openai/toolInvocation/invoking': 'Abriendo opciones de búsqueda...',
        'openai/toolInvocation/invoked': 'Opciones mostradas',
      },
      inputSchema: {
        missingFields: z.array(z.enum(['genero', 'tiempo', 'ocasion']))
          .describe('Lista de campos que FALTAN. Si el usuario pide para "boda", "fiesta" o "deporte", YA TIENES la ocasion, NO la metas aquí.'),
        currentData: z.object({
          genero: z.string().optional().describe('Ej: hombre, mujer, kids'),
          tiempo: z.string().optional().describe('Ej: frio, lluvia, calido'),
          ocasion: z.string().optional().describe('IMPORTANTE: Si el usuario menciona boda, fiesta, deporte, oficina o diario, ponlo aquí.'),
        }).optional().describe('Datos que YA HAS EXTRAÍDO del mensaje del usuario.')
      }
    },
    async ({ missingFields, currentData }: { missingFields: string[], currentData?: any }) => {
      try {
        console.log(`\n[WIDGET] Abriendo selector. Faltan: ${missingFields.join(', ')}`);

        return {
         
          content: [
            {
              type: 'text' as const,
              text: "He abierto el panel de opciones. Por favor, selecciona lo que falta."
            }
          ],
                   structuredContent: {
            missingFields: missingFields,
            currentData: currentData
          }
        };
      } catch (error) {
        return errorMessage('No se pudo cargar el selector visual.');
      }
    }
  );
}