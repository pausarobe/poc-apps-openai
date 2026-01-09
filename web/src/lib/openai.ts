import type { FlightData } from './types.js';

export interface ToolOutput {
  flightDetail?: FlightData;
  flightList?: FlightData[];
}
