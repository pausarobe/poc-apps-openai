import type { RegisterToolFn } from '../utils/types';

export function registerRentalCarListTool(registerTool: RegisterToolFn) {
  registerTool(
    'rental-car-list',
    {
      title: 'Rental Car List',
      description: 'List a rental car options',
      _meta: {
        'openai/outputTemplate': 'ui://widget/rental-car-list.html',
        'openai/widgetAccessible': true,
        'openai/toolInvocation/invoking': 'Displaying the board',
        'openai/toolInvocation/invoked': 'Displayed the board',
      },
    },
    async () => {
      console.error('Rental Car List tool invoked');

      return {
        content: [{ type: 'text' as const, text: `List of rental cars` }],
        structuredContent: {},
      };
    },
  );
}
