import type { RegisterToolFn } from '../utils/types.js';
import { registerAirplaneListTool } from './airplane-list.js';
import { registerFlightTestListTool } from './flight-test-list.js';
import { registerFlightDetailTool } from './flight-detail.js';
// import { registerFlightDetailTool } from './flight-detail.js';


export function registerTools(registerTool: RegisterToolFn) {
  registerAirplaneListTool(registerTool);
  registerFlightTestListTool(registerTool);
  registerFlightDetailTool(registerTool);
  // registerFlightDetailTool(registerTool);
}
