import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerAviationWidgetResource(server: McpServer, js: string) {
  server.registerResource(
    'aviation-widget',
    'ui://widget/aviation.html',
    {
      title: 'Aviation',
      description: 'Get a list of Airplanes',
    },
    async () => ({
      contents: [
        {
          uri: 'ui://widget/aviation.html',
          mimeType: 'text/html+skybridge',
          text: makeWidgetHtml(js),
          _meta: {
            'openai/widgetPrefersBorder': true,
            'openai/widgetDomain': 'https://chatgpt.com',
            'openai/widgetCSP': {
              connect_domains: ['https://chatgpt.com', 'https://api.aviationstack.com'],
              resource_domains: ['https://*.oaistatic.com', 'https://raw.githubusercontent.com'],
            },
          },
        },
      ],
    }),
  );
}
