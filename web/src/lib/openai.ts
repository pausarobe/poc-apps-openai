import type { CarData, FlightData, Item, ItemList, TrainData } from './types.js';

export interface ToolOutput {
  flightDetail?: FlightData;
  flightList?: FlightData[];
  carDetail?: CarData;
  carList?: CarData[];
  trainList?: TrainData;
  carCreate?: CarData;
  item?: Item;
  itemList?: ItemList;
  category?: string;
  type?: 'arrival' | 'departure';
}
