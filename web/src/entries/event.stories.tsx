import type { Story } from "@ladle/react";
import { useEffect } from 'react';
import type { EventData } from '../lib/openai';
import EventDashboard from './event';
import eventData from '../mock/events.json' with { type: 'json' };

// Mock tool output component for future implementations.
function MockToolOutput({ eventList, children }: { eventList: EventData[]; children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openai = {
        toolOutput: {
          eventList: eventList,
        },
      };
      window.dispatchEvent(new Event('openai:set_globals'));
    }
  }, [eventList]);
  return <>{children}</>;
}

export const Example: Story = () => {
  const events = (eventData as any).events || (Array.isArray(eventData) ? eventData : []);
  console.log('Número de eventos en el mock:', events.length);

  return (
    <MockToolOutput eventList={events}>
      <EventDashboard />
    </MockToolOutput>
  );
};

Example.storyName = "Event Example";