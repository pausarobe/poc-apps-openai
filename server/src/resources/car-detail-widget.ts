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
              // Permitimos la conexión a ChatGPT y a tu entorno específico de Magento Cloud
              connect_domains: [
                'https://chatgpt.com', 
                'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud'
              ],
              // Permitimos la carga de imágenes desde Magento Cloud y mantenemos los otros dominios
              resource_domains: [
                'https://*.oaistatic.com', 
                'https://raw.githubusercontent.com',
                'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud',
                'https://images.unsplash.com' // Mantenemos Unsplash por si usas placeholders
              ],
            },
          },
        },
      ],
    }),
  );
}