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

 INSTRUCCIONES ESTRICTAS DE FLUJO
1. AL INVOCAR ESTA HERRAMIENTA: Tu única respuesta debe ser: "He abierto el panel de opciones. Por favor, selecciona lo que falta y pulsa Enviar." NO inventes ropa aquí. DETENTE.
2. CUANDO EL USUARIO RESPONDA CON LOS DATOS: En el siguiente turno, el usuario te dará las opciones que eligió. TIENES TOTALMENTE PROHIBIDO INVENTAR LOOKS CON TEXTO.
3. TU SIGUIENTE PASO OBLIGATORIO: Debes usar inmediatamente la herramienta de búsqueda de catálogo (ej: 'catalog-discovery' ) pasándole los nuevos datos recogidos para encontrar productos reales en la base de datos.
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
    async ({ missingFields, currentData }: { missingFields: string[], currentData?: any }, extra) => {
      console.log('--- EXTRA ---');
      console.dir(extra, { depth: 10 });
      
      try {
        console.log(`\n[WIDGET] Abriendo selector. Faltan: ${missingFields.join(', ')}`);

        return {
          content: [
            {
              type: 'text' as const,
              text: "He abierto el panel de opciones. Por favor, selecciona lo que falta y pulsa Enviar."
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