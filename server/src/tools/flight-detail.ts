import { z } from 'zod';
import type { FlightData, RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import { FlightDetailMock } from '../mock/data';

export function registerFlightDetailTool(registerTool: RegisterToolFn) {
  registerTool(
    'flight-detail',
    {
      title: 'Flight Detail',
      description: 'Starting with a code (IATA), you can obtain the details of a flight',
      _meta: {
        'openai/outputTemplate': 'ui://widget/flight-detail.html',
        'openai/toolInvocation/invoking': 'Displaying the board',
        'openai/toolInvocation/invoked': 'Displayed the board',
      },
      inputSchema: {
        code: z.coerce.number().int().describe('Flight code (IATA)'),
      },
    },
    async ({ code }: { code: number }) => {
      let flightData: FlightData;
      console.error('Flight Detail tool invoked', code);

      if (!code) {
        return errorMessage('No se proporcionó ningún código de vuelo');
      }

      try {
        // const res = await fetch(`https://api.aviationstack.com/v1/flights?access_key=${process.env.PROVIDER_API_KEY}&flight_iata=${code}&limit=1`);
        // const data: any = await res.json();
        const mockData: any = FlightDetailMock;
        flightData = mockData?.data?.[0];
      } catch (error) {
        console.error('Error fetching airplanes:', error);
        return errorMessage('Ha habido un problema a la hora de obtener los detalles del vuelo');
      }

      return {
        content: [{ type: 'text' as const, text: `Aquí tienes los detalles del vuelo ${code} solicitado.` }],
        structuredContent: { flightDetail: flightData },
      };
    },
  );
}
