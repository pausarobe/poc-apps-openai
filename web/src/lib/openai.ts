import type { CarData, FlightData, ItemList, TrainData } from './types.js';

export interface ToolOutput {
  flightDetail?: FlightData;
  flightList?: FlightData[];
  carDetail?: CarData;
  carList?: CarData[];
  trainList?: TrainData;
  carCreate?: CarData;
  itemList?: ItemList;
  
  type?: 'arrival' | 'departure';
}
