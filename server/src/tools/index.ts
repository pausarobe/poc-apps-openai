import type { RegisterToolFn } from '../utils/types.js';
import { registerCarDetailTool } from './car-detail.js';
import { registerFlightDashboardTool } from './flight-dashboard.js';
import { registerFlightDetailTool } from './flight-detail.js';
import { registerCarDashboardTool } from './car-dashboard.js';
import { registerTrainDashboardTool } from './train-dashboard.js';
import { registerCreateCarTool } from './car-create.js';

export function registerTools(registerTool: RegisterToolFn) {
  registerFlightDetailTool(registerTool);
  registerFlightDashboardTool(registerTool);
  registerCarDetailTool(registerTool);
  registerCarDashboardTool(registerTool);
  registerTrainDashboardTool(registerTool);
  registerCreateCarTool(registerTool);
}
