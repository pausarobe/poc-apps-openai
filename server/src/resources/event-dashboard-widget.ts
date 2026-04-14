import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerEventDashboardWidgetResource(server: McpServer, js: string, css: string) {
  server.registerResource(
    'event-dashboard-widget',
    'ui://widget/event-dashboard.html',
    {
      title: 'Event Dashboard',
      description: 'Get a list of events.',
    },
    async () => ({
      contents: [
        {
          uri: 'ui://widget/event-dashboard.html',
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