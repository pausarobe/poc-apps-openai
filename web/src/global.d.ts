import type { ToolOutput } from "./lib/openai.js";

export {};

declare global {
  interface OpenAIWindowGlobals {
    toolInput?: unknown;
    toolOutput?: ToolOutput;
    toolResponseMetadata?: unknown;
    widgetState?: unknown;
    theme?: "light" | "dark";
    locale?: string;
  }

  interface OpenAIWindowApi {
    toolInput?: OpenAIWindowGlobals["toolInput"];
    toolOutput?: OpenAIWindowGlobals["toolOutput"];
    toolResponseMetadata?: OpenAIWindowGlobals["toolResponseMetadata"];
    widgetState?: OpenAIWindowGlobals["widgetState"];
    theme?: OpenAIWindowGlobals["theme"];
    locale?: OpenAIWindowGlobals["locale"];

    callTool?: (name: string, args: unknown) => Promise<unknown>;
    setWidgetState?: (state: unknown) => void;
  }

  interface Window {
    openai: OpenAIWindowApi;
  }
}
