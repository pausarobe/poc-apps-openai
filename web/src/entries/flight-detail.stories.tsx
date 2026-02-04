import type { Story } from '@ladle/react';
import { useEffect } from 'react';
import type { FlightData } from '../lib/types';
import FlightDetail from './flight-detail';
import { AllFlightsMock } from '../mock/data';

function MockToolOutput({ flightDetail, children }: { flightDetail: FlightData; children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Note: Stories use mock data. Real MCP Apps use MCP transport.
      (window as any).openai = {
        toolOutput: {
          flightDetail,
          type: 'arrival',
        },
      };

      window.dispatchEvent(new Event('openai:set_globals'));
    }
  }, [flightDetail]);

  return <>{children}</>;
}

export const Detail: Story = () => {
  return (
    <MockToolOutput flightDetail={AllFlightsMock.data[0] as FlightData}>
      <FlightDetail />
    </MockToolOutput>
  );
};

Detail.storyName = 'Flight Detail';
