import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerItemDetailWidgetResource(server: McpServer, js: string, css: string) {
  server.registerResource(
    'item-detail-widget',
    'ui://widget/item-detail.html',
    {
      title: 'Item Catalog Detail',
      description: 'Overview of the item detail',
    },
    async () => {
      console.log("Serving item detail widget resource");
      return ({
      contents: [
        {
          uri: 'ui://widget/item-detail.html',
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
    })},
  );
}