import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerCarDashboardWidgetResource(server: McpServer, js: string, css: string) {
  server.registerResource(
    'car-dashboard-widget',
    'ui://widget/car-dashboard.html',
    {
      title: 'Car Catalog Dashboard',
      description: 'Overview of the car inventory',
    },
    async () => ({
      contents: [
        {
          uri: 'ui://widget/car-dashboard.html',
          mimeType: 'text/html+skybridge',
          text: makeWidgetHtml(js, css),
          _meta: {
            'openai/widgetPrefersBorder': true,
            'openai/widgetDomain': 'https://chatgpt.com',
            'openai/widgetCSP': {
              connect_domains: ['https://chatgpt.com', 'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud'],
              resource_domains: ['https://*.oaistatic.com', 'https://raw.githubusercontent.com',
                'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud'],
            },
          },
        },
      ],
    }),
  );
}