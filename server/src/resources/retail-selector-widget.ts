import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeWidgetHtml } from '../utils/helpers.js';

export function registerRetailSelectorWidgetResource(server: McpServer, js: string, css: string) {
  server.registerResource(
    'retail-selector-widget',
    'ui://widget/retail-selector.html',
    {
      title: 'Item Selector Widget',
      description: 'Widget for selecting items from the catalog',
    },
    async () => {
      console.log("Serving retail selector widget resource");
      return ({
      contents: [
        {
          uri: 'ui://widget/retail-selector.html',
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