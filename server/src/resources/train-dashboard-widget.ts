import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerTrainDashboardWidgetResource(server: McpServer, js: string, css: string) {
  server.registerResource(
    'train-dashboard-widget',
    'ui://widget/train-dashboard.html',
    {
      title: 'Train Dashboard',
      description: 'Get a list of train arrivals from a station.',
    },
    async () => ({
      contents: [
        {
          uri: 'ui://widget/train-dashboard.html',
          mimeType: 'text/html',
          text: makeWidgetHtml(js, css),
        },
      ],
    }),
  );
}
