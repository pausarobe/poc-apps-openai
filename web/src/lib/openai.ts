/**
 * @deprecated This file is deprecated. Import from './types.js' instead.
 * Kept for backward compatibility during migration.
 */
export type { CarData, FlightData, TrainData } from './types.js';

export interface ToolOutput {
  flightDetail?: any;
  flightList?: any[];
  carDetail?: any;
  carList?: any[];
  trainList?: any;
  carCreate?: any;
  type?: 'arrival' | 'departure';
}
