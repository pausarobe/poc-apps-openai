import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerFlightDashboardWidgetResource(server: McpServer, js: string,  css: string) {
  server.registerResource(
    'flight-dashboard-widget',
    'ui://widget/flight-dashboard.html',
    {
      title: 'Flight Dashboard',
      description: 'Get a list of arrivals or departures from a airport.',
    },
    async () => ({
      contents: [
        {
          uri: 'ui://widget/flight-dashboard.html',
          mimeType: 'text/html',
          text: makeWidgetHtml(js, css),
        },
      ],
    }),
  );
}
