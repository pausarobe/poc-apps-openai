import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerRentalCarListWidgetResource(server: McpServer, js: string, css: string) {
  server.registerResource(
    'rental-car-list-widget',
    'ui://widget/rental-car-list.html',
    {
      title: 'Rental Car List',
      description: 'Get a rental car list',
    },
    async () => ({
      contents: [
        {
          uri: 'ui://widget/rental-car-list.html',
          mimeType: 'text/html+skybridge',
          text: makeWidgetHtml(js, css),
          _meta: {
            'openai/widgetPrefersBorder': true,
            'openai/widgetDomain': 'https://chatgpt.com',
            'openai/widgetCSP': {
              connect_domains: ['https://chatgpt.com'],
              resource_domains: ['https://*.oaistatic.com'],
            },
          },
        },
      ],
    }),
  );
}
