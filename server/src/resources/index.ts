import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFlightDetailWidgetResource } from './flight-detail-widget.js';
import { registerFlightDashboardWidgetResource } from './flight-dashboard-widget.js';

export function registerResources(server: McpServer, assets: { CSS: string; JS_FLIGHT_DASHBOARD: string; JS_FLIGHT_DETAIL: string }) {
  registerFlightDashboardWidgetResource(server, assets.JS_FLIGHT_DASHBOARD, assets.CSS);
  registerFlightDetailWidgetResource(server, assets.JS_FLIGHT_DETAIL, assets.CSS);
}
