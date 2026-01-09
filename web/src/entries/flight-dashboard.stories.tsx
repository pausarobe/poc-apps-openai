import FlightDashboard, { sampleFlights } from "./flight-dashboard";
import type { Story } from "@ladle/react";
import { useEffect } from "react";
import type { FlightData } from "../lib/types";

function MockToolOutput({ flightList, children }: { flightList: FlightData[]; children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openai = {
        toolOutput: {
          flightList,
        },
      } as any;

      window.dispatchEvent(new Event('openai:set_globals'));
    }
  }, [flightList]);

  return <>{children}</>;
}

export const Default: Story = () => {
  return (
    <MockToolOutput flightList={sampleFlights}>
      <FlightDashboard />
    </MockToolOutput>
  );
};

Default.storyName = "Arrival Dashboard";

export const Empty: Story = () => {
  return (
    <MockToolOutput flightList={[]}>
      <FlightDashboard />
    </MockToolOutput>
  );
};

Empty.storyName = "Empty State";

export const MultipleFlights: Story = () => {
  const multipleFlights: FlightData[] = [
    ...sampleFlights,
    {
      flight_date: "2026-01-09",
      flight_status: "landed",
      flight: { number: "1234", iata: "I21234", icao: "IBS1234", codeshared: null },
      departure: {
        airport: "London Heathrow",
        timezone: "Europe/London",
        iata: "LHR",
        icao: "EGLL",
        terminal: "5",
        gate: "A12",
        delay: null,
        scheduled: "2026-01-09T10:00:00+00:00",
        estimated: "2026-01-09T10:00:00+00:00",
        actual: "2026-01-09T10:05:00+00:00",
        estimated_runway: null,
        actual_runway: null,
      },
      arrival: {
        airport: "Barajas",
        timezone: "Europe/Madrid",
        iata: "MAD",
        icao: "LEMD",
        terminal: "4",
        gate: "B15",
        baggage: "3",
        scheduled: "2026-01-09T13:30:00+00:00",
        delay: null,
        estimated: "2026-01-09T13:35:00+00:00",
        actual: "2026-01-09T13:40:00+00:00",
        estimated_runway: null,
        actual_runway: null,
      },
      airline: { name: "British Airways", iata: "BA", icao: "BAW" },
      aircraft: { registration: "G-ABCD", iata: "320", icao: "A320", icao24: "123456" },
      live: null,
    },
    {
      flight_date: "2026-01-09",
      flight_status: "scheduled",
      flight: { number: "5678", iata: "I25678", icao: "IBS5678", codeshared: null },
      departure: {
        airport: "Paris Charles de Gaulle",
        timezone: "Europe/Paris",
        iata: "CDG",
        icao: "LFPG",
        terminal: "2E",
        gate: "K20",
        delay: null,
        scheduled: "2026-01-09T11:00:00+00:00",
        estimated: "2026-01-09T11:00:00+00:00",
        actual: null,
        estimated_runway: null,
        actual_runway: null,
      },
      arrival: {
        airport: "Barajas",
        timezone: "Europe/Madrid",
        iata: "MAD",
        icao: "LEMD",
        terminal: "4",
        gate: null,
        baggage: null,
        scheduled: "2026-01-09T13:00:00+00:00",
        delay: null,
        estimated: "2026-01-09T13:00:00+00:00",
        actual: null,
        estimated_runway: null,
        actual_runway: null,
      },
      airline: { name: "Air France", iata: "AF", icao: "AFR" },
      aircraft: { registration: "F-HXYZ", iata: "321", icao: "A321", icao24: "789012" },
      live: null,
    },
  ];

  return (
    <MockToolOutput flightList={multipleFlights}>
      <FlightDashboard />
    </MockToolOutput>
  );
};

MultipleFlights.storyName = "Multiple Flights";
