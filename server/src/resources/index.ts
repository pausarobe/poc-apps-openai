import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAviationWidgetResource } from './aviation-widget.js';
import { registerFlightTestWidgetResource } from './flight-test-widget.js';

export function registerResources(server: McpServer, assets: { JS: string; JS_TEST: string }) {
  registerAviationWidgetResource(server, assets.JS);
  registerFlightTestWidgetResource(server, assets.JS_TEST);
}
