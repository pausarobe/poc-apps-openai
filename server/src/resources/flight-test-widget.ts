import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerFlightTestWidgetResource(server: McpServer, jsTest: string) {
  server.registerResource(
    'flight-test-widget',
    'ui://widget/flighttest.html',
    {
      title: 'Flighttest',
      description: 'Get a list of testing flights',
    },
    async () => ({
      contents: [
        {
          uri: 'ui://widget/flighttest.html',
          mimeType: 'text/html+skybridge',
          text: makeWidgetHtml(jsTest),
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
