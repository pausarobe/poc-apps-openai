import { z } from 'zod';
import type { RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import { trainMock } from '../mock/train.mock.js';

export function registerTrainDashboardTool(registerTool: RegisterToolFn) {
  registerTool(
    'train-dashboard',
    {
      title: 'Train Dashboard',
      description: 'Starting with a name station, you can obtain a dashboard of trains arrivals',
      _meta: {
        'openai/outputTemplate': 'ui://widget/train-dashboard.html',
        'openai/toolInvocation/invoking': 'Displaying the board',
        'openai/toolInvocation/invoked': 'Displayed the board',
      },
      inputSchema: {
        name: z.coerce.string().describe('Name station'),
      },
    },
    async ({ name }: { name: string }) => {
      // let trainList: any;
      console.error('Train Dashboard tool invoked', name);

      if (!name) {
        return errorMessage('No se proporcionó ninguna estación');
      }

      // try {
      //   const mockData = trainMock;
      //   trainList = mockData?.data;
      // } catch (error) {
      //   console.error('Error fetching trains:', error);
      //   return errorMessage('Ha habido un problema a la hora de obtener los detalles del tren');
      // }

      return {
        content: [{ type: 'text' as const, text: `Aquí los detalles de los viajes de tren para ${name} solicitados.` }],
        structuredContent: { trainList: trainMock },
      };
    },
  );
}
