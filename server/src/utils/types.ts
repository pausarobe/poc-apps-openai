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
  custom_attributes?: Array<{
    [key: string]: unknown;
  }>;
}

export type ItemList = Item[];
