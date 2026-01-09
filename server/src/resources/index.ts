import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAviationWidgetResource } from './aviation-widget.js';
import { registerFlightDetailWidgetResource } from './flight-detail-widget.js';
import { registerFlightDashboardWidgetResource } from './flight-dashboard-widget.js';

export function registerResources(server: McpServer, assets: { JS: string; JS_FLIGHT_DASHBOARD: string; JS_FLIGHT_DETAIL: string }) {
  registerAviationWidgetResource(server, assets.JS);
  registerFlightDashboardWidgetResource(server, assets.JS_FLIGHT_DASHBOARD);
  registerFlightDetailWidgetResource(server, assets.JS_FLIGHT_DETAIL);
}
