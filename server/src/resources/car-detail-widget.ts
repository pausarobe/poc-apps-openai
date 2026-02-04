import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerCarDetailWidgetResource(server: McpServer, js: string, css: string) {
  server.registerResource(
    'car-detail-widget',
    'ui://widget/car-detail.html', 
    {
      title: 'Car Detail',
      description: 'Show the technical sheet and rental costs of a vehicle',
    },
    async () => ({
      contents: [
        {
          uri: 'ui://widget/car-detail.html',
          mimeType: 'text/html',
          text: makeWidgetHtml(js, css),
        },
      ],
    }),
  );
}