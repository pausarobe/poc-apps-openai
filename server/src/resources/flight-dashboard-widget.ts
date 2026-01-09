import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerFlightDashboardWidgetResource(server: McpServer, js: string) {
  server.registerResource(
    'flight-dashboard-widget',
    'ui://widget/flightdashboard.html',
    {
      title: 'Flight Dashboard',
      description: 'Get a list of arrivals or departures from a airport.',
    },
    async () => ({
      contents: [
        {
          uri: 'ui://widget/flightdashboard.html',
          mimeType: 'text/html+skybridge',
          text: makeWidgetHtml(js),
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
