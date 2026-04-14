import { z } from 'zod';
import type { RegisterToolFn } from '../utils/types';
import { errorMessage } from '../utils/helpers.js';
import { events } from '../mock/events.js';

export function registerEventDashboardTool(registerTool: RegisterToolFn) {
    registerTool (
        'event-dashboard',
    {
        title: 'Event Dashboard',
        description: 'Obtain a list of relevant events in the technology industry.',
        _meta: {
            'openai/outputTemplate': 'ui://widget/event-dashboard.html',
            'openai/toolInvocation/invoking': 'Loading events...',
            'openai/toolInvocation/invoked': 'Events loaded successfully',
        },
        inputSchema: {},
    },
    async () => {
        return {
        content: [{ type: 'text' as const, text: 'Eventos cargados.' }],
        structuredContent: {
          eventList: events,
        },
      };
    },
    );

}