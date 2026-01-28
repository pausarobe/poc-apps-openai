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
          mimeType: 'text/html+skybridge',
          text: makeWidgetHtml(js, css), 
          _meta: {
            'openai/widgetPrefersBorder': true,
            'openai/widgetDomain': 'https://chatgpt.com',
            'openai/widgetCSP': {
              connect_domains: [
                'https://chatgpt.com', 
                'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud' // Tu entorno de Magento Cloud
              ],
              resource_domains: [
                'https://*.oaistatic.com', 
                'https://raw.githubusercontent.com',
                'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud', // Para cargar imágenes del catálogo
                'https://images.unsplash.com'
              ],
            },
          },
        },
      ],
    }),
  );
}