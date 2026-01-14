import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFlightDetailWidgetResource } from './flight-detail-widget.js';
import { registerFlightDashboardWidgetResource } from './flight-dashboard-widget.js';
import { registerCarDetailWidgetResource } from './car-detail-widget.js';
import { registerRentalCarListWidgetResource } from './rental-car-list-widget.js';

export function registerResources(server: McpServer, assets: { CSS: string; JS_FLIGHT_DASHBOARD: string; JS_FLIGHT_DETAIL: string; JS_CAR_DETAIL: string; JS_CAR_DASHBOARD: string; JS_RENTAL_CAR: string }) {
  registerFlightDashboardWidgetResource(server, assets.JS_FLIGHT_DASHBOARD, assets.CSS);
  registerFlightDetailWidgetResource(server, assets.JS_FLIGHT_DETAIL, assets.CSS);
  registerCarDetailWidgetResource(server, assets.JS_CAR_DETAIL, assets.CSS);
  registerRentalCarListWidgetResource(server, assets.JS_RENTAL_CAR, assets.CSS);

}
