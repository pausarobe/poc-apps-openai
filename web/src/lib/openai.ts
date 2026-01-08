import type { Airplane, FlightData } from './types.js';

export interface ToolOutput {
  airplaneList?: Airplane[];
  flightDetail?: FlightData;
}
