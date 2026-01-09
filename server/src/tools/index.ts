import type { RegisterToolFn } from '../utils/types.js';
import { registerFlightDashboardTool } from './flight-dashboard.js';
import { registerFlightDetailTool } from './flight-detail.js';

export function registerTools(registerTool: RegisterToolFn) {
  registerFlightDetailTool(registerTool);
  registerFlightDashboardTool(registerTool);

}
