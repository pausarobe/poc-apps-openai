import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAviationWidgetResource } from './aviation-widget.js';
import { registerFlightTestWidgetResource } from './flight-test-widget.js';
import { registerFlightDetailWidgetResource } from './flight-detail-widget.js';

export function registerResources(server: McpServer, assets: { JS: string; CSS: string; JS_TEST: string; JS_FLIGHT_DETAIL: string }) {
  registerAviationWidgetResource(server, assets.JS);
  registerFlightTestWidgetResource(server, assets.JS_TEST);
  registerFlightDetailWidgetResource(server, assets.JS_FLIGHT_DETAIL, assets.CSS);
}
