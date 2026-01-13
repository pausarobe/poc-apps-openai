import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFlightDetailWidgetResource } from './flight-detail-widget.js';
import { registerFlightDashboardWidgetResource } from './flight-dashboard-widget.js';
import { registerRentalCarListWidgetResource } from './rental-car-list-widget.js';

export function registerResources(server: McpServer, assets: { JS: string; CSS: string; JS_FLIGHT_DETAIL: string; JS_RENTAL_CAR: string; JS_FLIGHT_DASHBOARD: string }) {
  registerFlightDetailWidgetResource(server, assets.JS_FLIGHT_DETAIL, assets.CSS);
  registerFlightDashboardWidgetResource(server, assets.JS_FLIGHT_DASHBOARD, assets.CSS);
  registerRentalCarListWidgetResource(server, assets.JS_RENTAL_CAR, assets.CSS);
}
