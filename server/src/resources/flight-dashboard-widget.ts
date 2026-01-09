import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerFlightDashboardWidgetResource(server: McpServer, js: string,  css: string) {
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
          text: makeWidgetHtml(js, css),
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
