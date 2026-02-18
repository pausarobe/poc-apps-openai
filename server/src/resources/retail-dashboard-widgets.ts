import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerRetailDashboardWidgetResource(server: McpServer, js: string, css: string) {
  server.registerResource(
    'retail-dashboard-widget',
    'ui://widget/retail-dashboard.html',
    {
      title: 'Item Catalog Dashboard',
      description: 'Overview of the items inventory',
    },
    async () => {
      console.log("Serving retail dashboard widget resource");
      return ({
        contents: [
          {
            uri: 'ui://widget/retail-dashboard.html',
            mimeType: 'text/html+skybridge',
            text: makeWidgetHtml(js, css),
            _meta: {
              'openai/widgetPrefersBorder': true,
              'openai/widgetDomain': 'https://chatgpt.com',
              'openai/widgetCSP': {
                connect_domains: ['https://chatgpt.com', 'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud'],
                resource_domains: ['https://*.oaistatic.com', 'https://raw.githubusercontent.com',
                  'https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud'],
              },
            },
          },
        ],
      });
    }
  );
}