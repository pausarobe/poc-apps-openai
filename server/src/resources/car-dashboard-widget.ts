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
          mimeType: 'text/html',
          text: makeWidgetHtml(js, css),
        },
      ],
    }),
  );
}