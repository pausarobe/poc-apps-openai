import type { CarData, FlightData, TrainData } from './types.js';

export interface ToolOutput {
  flightDetail?: FlightData;
  flightList?: FlightData[];
  carDetail?: CarData;
  carList?: CarData[];
  trainList?: TrainData;
  carCreate?: CarData;
  type?: 'arrival' | 'departure';
}
