import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerFlightDetailWidgetResource(server: McpServer, js: string, css: string) {
  server.registerResource(
    'flight-detail-widget',
    'ui://widget/flight-detail.html',
    {
      title: 'Flight Detail',
      description: 'Get a flight detail',
    },
    async () => ({
      contents: [
        {
          uri: 'ui://widget/flight-detail.html',
          mimeType: 'text/html',
          text: makeWidgetHtml(js, css),
        },
      ],
    }),
  );
}
