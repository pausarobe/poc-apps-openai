import type { CarData, FlightData } from './types.js';

export interface ToolOutput {
  flightDetail?: FlightData;
  flightList?: FlightData[];
  carDetail?: CarData;
  carList?: CarData[];
}
