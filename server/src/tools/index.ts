import { registerAirplaneListTool } from './airplane-list.js';
import { registerFlightTestListTool } from './flight-test-list.js';
import type { RegisterToolFn } from '../utils/types.js';

export function registerTools(registerTool: RegisterToolFn) {
  registerAirplaneListTool(registerTool);
  registerFlightTestListTool(registerTool);
}
