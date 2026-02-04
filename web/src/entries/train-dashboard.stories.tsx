import type { Story } from '@ladle/react';
import { useEffect } from 'react';
import TrainDashboard from './train-dashboard';
import { trainMock } from '../mock/data';

function MockToolOutput({ trainList, children }: { trainList: any; children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Note: Stories use mock data. Real MCP Apps use MCP transport.
      (window as any).openai = {
        toolOutput: {
          trainList,
        },
      };

      window.dispatchEvent(new Event('openai:set_globals'));
    }
  }, [trainList]);

  return <>{children}</>;
}

export const TrainList: Story = () => {
  return (
    <MockToolOutput trainList={trainMock}>
      <TrainDashboard />
    </MockToolOutput>
  );
};

TrainList.storyName = 'Train Dashboard';
