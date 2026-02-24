import type { createRegisterTool } from './helpers';

export type RegisterToolFn = ReturnType<typeof createRegisterTool>;

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
export type Item = {
  uid: string;
  sku: string;
  name: string;
  status?: number;
  price?: number;
  category?: string;
  description?: string;
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
  properties?: {
    [key: string]: any; 
  };
  custom_attributes?: Array<{
    [key: string]: unknown;
  }>;
  related_products?: Array<Item>;
}

export type ItemList = Item[];

export type Look = {
  id?: number;
  uid?: string;
  sku: string;
  name: string;
  category?: string;
  price: number;
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