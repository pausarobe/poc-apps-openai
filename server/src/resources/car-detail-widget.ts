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
          mimeType: 'text/html+skybridge',
          text: makeWidgetHtml(js, css), // Inyecta el JS y CSS compilado de la carpeta web
          _meta: {
            'openai/widgetPrefersBorder': true,
            'openai/widgetDomain': 'https://chatgpt.com',
            'openai/widgetCSP': {
              connect_domains: ['https://chatgpt.com'],
              
              resource_domains: [
                'https://*.oaistatic.com', 
                'https://raw.githubusercontent.com',
                'https://images.unsplash.com'
              ],
            },
          },
        },
      ],
    }),
  );
}