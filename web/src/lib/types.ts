export interface Airplane {
  iata_code_long: string;
  production_line: string;
  model_name: string;
}
export interface CarData {
  id: number;
  sku: string;
  name: string;
  status: number;
  price: number;
  media_gallery_entries:
  {
    id: number,
    media_type: string,
    label: string | null,
    position: number,
    disabled: boolean,
    types: string[],
    file: string

  }[],
  custom_attributes: Array<{
    attribute_code: string;
    value: any;
  }>;
}

export type Item = {
  uid: string;
  sku: string;
  name: string;
  status?: number;
  price?: number;
  description?: string;
  media_gallery_entries?: {
    label: string,
    url: string
  }[],
  image?: {
    label: string;
    url: string;
  };
  visibleTags?: {
    genero?: string;
    tiempo?: string;
    ocasion?: string;
    [key: string]: unknown;
  };
  thumbnail?: {
    label: string;
    url: string;
  };
  custom_attributes?: Array<{
    [key: string]: unknown;
  }>;
  related_products?: Array<Item>;
}

export type ItemList = Item[];

// ADVERTISING: FlightData type used in web and server, actualize both when modifying
export interface FlightData {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal?: string | null;
    gate?: string | null;
    delay?: number | null;
    scheduled: string;
    estimated: string;
    actual?: string | null;
    estimated_runway?: string | null;
    actual_runway?: string | null;
  };
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal?: string | null;
    gate?: string | null;
    baggage?: string | null;
    scheduled: string;
    delay?: number | null;
    estimated?: string | null;
    actual?: string | null;
    estimated_runway?: string | null;
    actual_runway?: string | null;
  };
  airline: {
    name: string;
    iata: string;
    icao: string;
  };
  flight: {
    number: string;
    iata: string;
    icao: string;
    codeshared?: any;
  };
  aircraft?: {
    registration?: string | null;
    iata?: string | null;
    icao?: string | null;
    icao24?: string;
  } | null;
  live?: any;
}

// Train
export interface TrainData {
  data: Trip[];
}

export interface Trip {
  start: string;
  end: string;
  duration: number;
  legs: Leg[];
}

export interface Leg {
  agency: Agency;
  mode: string;
  distance: number;
  duration: number;
  startTime: number;
  endTime: number;
  arrivalDelay: number;
  departureDelay: number;
  alerts: any[];
  from: Place;
  to: Place;
  intermediatePlace: boolean;
  intermediatePlaces: IntermediatePlace[];
  route: Route;
}

export interface Agency {
  fareUrl: string | null;
  gtfsId: string;
  lang: string;
  name: string;
  phone: string;
  timezone: string;
  url: string;
}

export interface Place {
  name: string;
  arrivalTime: number;
  departureTime: number;
  stop: Stop;
}

export interface IntermediatePlace {
  arrivalTime: number;
  departureTime: number;
  lat: number;
  lon: number;
  name: string;
  vertexType: string; // e.g. "TRANSIT"
}

export interface Stop {
  id?: string;
  gtfsId: string;
  name?: string;
  lat: number;
  lon: number;
}

export interface Route {
  id: string;
  shortName: string;
  longName: string | null;
  url: string | null;
  type: number;
  textColor: string | null;
  color: string;
  patterns: Pattern[];
  stops: RouteStop[];
}

export interface Pattern {
  code: string;
  vehiclePositions: any[];
}

export interface RouteStop {
  id: string;
  gtfsId: string;
  name: string;
  lat: number;
  lon: number;
}

export type Look = {
  id: number;
  uid: string;
  sku: string;
  name: string;
  category?: string;
  price?: number;
  description?: string;
  properties?:{
    genero?: string;
    tiempo?: string;
    ocasion?: string;
    [key: string]: unknown;
  }
  related_products?: LookItem[];

  product_links?: Array<{
    linked_product_sku: string;
    link_type: string;
    position: number;
  }>;
  media_gallery_entries?: {
    label: string,
    url: string
  }[],
  image?: {
    label: string;
    url: string;
  };
  thumbnail?: {
    label: string;
    url: string;
  };
  custom_attributes?: Array<{
    [key: string]: unknown;
  }>;
}

export type LookItem = {
  id?: number;
  uid?: string;
  sku: string;
  name: string;
  price: number;
  description?: string;
  buyUrl?: string;
  media_gallery_entries?: {
    label: string,
    url: string
  }[],
  image?: {
    label: string;
    url: string;
  };
  custom_attributes?: Array<{
    [key: string]: unknown;
  }>;
}
export type LookDetailResponse = {
  look: Look;
  items: LookItem[];
}
export type LookList = Look[];
