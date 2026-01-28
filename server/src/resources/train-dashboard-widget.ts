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
          mimeType: 'text/html+skybridge',
          text: makeWidgetHtml(js, css),
          _meta: {
            'openai/widgetPrefersBorder': true,
            'openai/widgetDomain': 'https://chatgpt.com',
            'openai/widgetCSP': {
              connect_domains: ['https://chatgpt.com'],
              resource_domains: ['https://*.oaistatic.com', 'https://yt3.googleusercontent.com'],
            },
          },
        },
      ],
    }),
  );
}
