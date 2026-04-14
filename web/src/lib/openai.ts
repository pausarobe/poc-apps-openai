import type { CarData, FlightData, Item, ItemList, LookList, TrainData } from './types.js';

export type EventData = {
  id: number;
  title: string;
  description: string;
  date: string;
  sections?: Array<{
    id: number;
    sectionTitle: string;
    sectionContent: string;
    image: string;
  }>;
};

export interface ToolOutput {
  flightDetail?: FlightData;
  flightList?: FlightData[];
  carDetail?: CarData;
  carList?: CarData[];
  trainList?: TrainData;
  carCreate?: CarData;
  item?: Item;
  itemList?: ItemList;
  eventList?: EventData[];
  category?: string;
  lookList?: LookList;
  metaData?: MetaData | undefined;
  type?: 'arrival' | 'departure';
}

export interface MetaData {
  colorPalette?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
}