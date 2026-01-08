import { z } from 'zod';
import type { RegisterToolFn } from '../utils/types';

export function registerAirplaneListTool(registerTool: RegisterToolFn) {
  registerTool(
    'airplane-list',
    {
      title: 'List of Airplanes',
      description: 'Show a defined number of Airplanes.',
      _meta: {
        'openai/outputTemplate': 'ui://widget/aviation.html',
        'openai/toolInvocation/invoking': 'Displaying the board',
        'openai/toolInvocation/invoked': 'Displayed the board',
      },
      inputSchema: {
        number: z.coerce.number().int().min(1).max(200).describe('Number of airplane to list'),
      },
    },
    async ({ number }: { number: number }) => {
      console.error('Aviation tool invoked');
      const limit = number;
      let airplaneDetail: any[] = [];

      try {
        // console.log(`Fetching airplanes from AviationStack API https://api.aviationstack.com/v1/airplanes?access_key=${process.env.PROVIDER_API_KEY}&limit=${limit}`);
        // const res = await fetch(`https://api.aviationstack.com/v1/airplanes?access_key=${process.env.PROVIDER_API_KEY}&limit=${limit}`);
        // const data: any = await res.json();
        // airplaneDetail = await Promise.all(
        //   data.results.map(async (p: any) => {
        //     const r = await fetch(p.url);
        //     return r.json();
        //   }),
        // );
      } catch (error) {
        console.error('Error fetching airplanes:', error);
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: `Aquí tienes los ${limit} Aviones solicitados.`,
          },
        ],
        structuredContent: {
          airplaneList: airplaneDetail.map((p: any) => ({
            iata_code_long: p.iata_code_long,
            production_line: p.production_line,
            model_name: p.model_name,
          })),
          tool: 'airplane-list',
        },
      };
    },
  );
}
