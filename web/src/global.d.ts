import type { ToolOutput } from './lib/openai.js';

export {};

declare global {
  const __WEATHER_API_KEY__: string;

  interface OpenAIWindowGlobals {
    toolInput?: unknown;
    toolOutput?: ToolOutput;
    toolResponseMetadata?: unknown;
    widgetState?: unknown;
    theme?: 'light' | 'dark';
    locale?: string;
  }

  interface OpenAIWindowApi {
    toolInput?: OpenAIWindowGlobals['toolInput'];
    toolOutput?: OpenAIWindowGlobals['toolOutput'];
    toolResponseMetadata?: OpenAIWindowGlobals['toolResponseMetadata'];
    widgetState?: OpenAIWindowGlobals['widgetState'];
    theme?: OpenAIWindowGlobals['theme'];
    locale?: OpenAIWindowGlobals['locale'];
    sendFollowUpMessage?: (message: { prompt: string }) => Promise<void>;
    callTool?: (name: string, args: unknown) => Promise<unknown>;
    setWidgetState?: (state: unknown) => void;
  }

  interface Window {
    openai: OpenAIWindowApi;
  }
}
