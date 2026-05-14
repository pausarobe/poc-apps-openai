import type { CarData, FlightData, Item, ItemList, LookList, TrainData } from './types.js';

export type EventData = {
  id: number;
  title: string;
  description: string;
  date: string;
  location?: string;
  tag?: string;
  image?: string;
  sections?: Array<{
    id?: number;
    tabTitle?: string;
    sectionTitle?: string;
    sectionContent?: string;
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
  eventFavoriteList?: String[];
  category?: string;
  lookList?: LookList;
  metaData?: MetaData | undefined;
  type?: 'arrival' | 'departure';
}

export interface MetaData {
  colorPalette?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
}