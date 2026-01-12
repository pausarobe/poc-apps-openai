import type { Story } from "@ladle/react";
import { useEffect } from "react";
import type { FlightData } from "../lib/types";
import { MadridArrivalsMock } from "../mock/data";
import FlightDashboard from "./flight-dashboard";

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
    <MockToolOutput flightList={MadridArrivalsMock.data}>
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
