import type { Story } from '@ladle/react';
import { useEffect } from 'react';
import TrainDashboard from './train-dashboard';
import { trainMock } from '../mock/data';

function MockToolOutput({ trainList, children }: { trainList: any; children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openai = {
        toolOutput: {
          trainList,
        },
      } as any;

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
