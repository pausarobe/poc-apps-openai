import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFlightDetailWidgetResource } from './flight-detail-widget.js';
import { registerFlightDashboardWidgetResource } from './flight-dashboard-widget.js';
import { registerCarDetailWidgetResource } from './car-detail-widget.js';
import { registerCarDashboardWidgetResource } from './car-dashboard-widget.js';
import { registerTrainDashboardWidgetResource } from './train-dashboard-widget.js';
import { registerCarCreateWidgetResource } from './car-create-widget.js';
export function registerResources(
  server: McpServer,
  assets: { CSS: string; JS_FLIGHT_DASHBOARD: string; JS_FLIGHT_DETAIL: string; JS_CAR_DETAIL: string; JS_CAR_DASHBOARD: string; JS_RENFE: string; JS_CAR_CREATE: string },
) {
  registerFlightDashboardWidgetResource(server, assets.JS_FLIGHT_DASHBOARD, assets.CSS);
  registerFlightDetailWidgetResource(server, assets.JS_FLIGHT_DETAIL, assets.CSS);
  registerCarDetailWidgetResource(server, assets.JS_CAR_DETAIL, assets.CSS);
  registerCarDashboardWidgetResource(server, assets.JS_CAR_DASHBOARD, assets.CSS);
  registerCarCreateWidgetResource(server, assets.JS_CAR_CREATE, assets.CSS);
  registerTrainDashboardWidgetResource(server, assets.JS_RENFE, assets.CSS);
}
