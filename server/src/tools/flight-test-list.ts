import type { RegisterToolFn } from '../utils/types';

export function registerFlightTestListTool(registerTool: RegisterToolFn) {
  registerTool(
    'flight-test-list',
    {
      title: 'List of Testing Flights',
      description: 'Show a defined number of Testing Flights.',
      _meta: {
        'openai/outputTemplate': 'ui://widget/flighttest.html',
        'openai/toolInvocation/invoking': 'Displaying the board',
        'openai/toolInvocation/invoked': 'Displayed the board',
      },
    },
    async () => {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Herramienta de testeo.`,
          },
        ],
        structuredContent: {
          tool: 'flight-test-list',
        },
      };
    },
  );
}
