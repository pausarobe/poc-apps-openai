import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerCarCreateWidgetResource(server: McpServer, js: string, css: string) {
  server.registerResource(
    'car-create-widget',
    'ui://widget/car-create.html', 
    {
      title: 'Gestión de Alta de Vehículos',
      description: 'Formulario dinámico para introducir datos del coche y confirmar su creación en Magento Cloud',
    },
    async () => ({
      contents: [
        {
          uri: 'ui://widget/car-create.html',
          mimeType: 'text/html',
          text: makeWidgetHtml(js, css),
        },
      ],
    }),
  );
}