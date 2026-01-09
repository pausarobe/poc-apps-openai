import { z } from 'zod';
import type { FlightData, RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import { FlightDetailMock } from '../mock/data.js';

export function registerFlightDashboardTool(registerTool: RegisterToolFn) {
  registerTool(
    'flight-dashboard',
    {
      title: 'Flight Dashboard',
      description: 'Starting with a code (IATA) from a airport, you can obtain a dashboard of flights arrivals or departures',
      _meta: {
        'openai/outputTemplate': 'ui://widget/flight-dashboard.html',
        'openai/toolInvocation/invoking': 'Displaying the board',
        'openai/toolInvocation/invoked': 'Displayed the board',
      },
      inputSchema: {
        code: z.coerce.number().int().describe('Airport code (IATA)'),
        type: z.coerce.string().describe('Type of dashboard (arrivals or departures)'),
      },
    },
    async ({ code, type }: { code: number; type: string }) => {
      let flightData: FlightData;
      console.error('Flight Dashboard tool invoked', code, type);

      if (!code || !type) {
        return errorMessage('No se proporcionó ningún código de aeropuerto o tipo de tablero');
      }

      try {
        // const res = await fetch(`https://api.aviationstack.com/v1/flights?access_key=${process.env.PROVIDER_API_KEY}&flight_iata=${code}&limit=1`);
        // const data: any = await res.json();
        const mockData: any = FlightDetailMock;
        flightData = mockData?.data;
      } catch (error) {
        console.error('Error fetching airplanes:', error);
        return errorMessage('Ha habido un problema a la hora de obtener los detalles del vuelo');
      }

      return {
        content: [{ type: 'text' as const, text: `Aquí los detalles del aeropuerto ${code} solicitado.` }],
        structuredContent: { flightDetail: flightData },
      };
    },
  );
}
