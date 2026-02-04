import { useSyncExternalStore } from 'react';
import { mcpApp } from './mcp-app.js';
import type { ToolOutput } from './types.js';

/**
 * Hook to access MCP App tool output
 * Replaces the previous OpenAI global pattern
 */
export function useMcpToolOutput(): ToolOutput | undefined {
  return useSyncExternalStore(
    (onStoreChange: () => void) => {
      return mcpApp.subscribe(onStoreChange);
    },
    () => mcpApp.getToolOutput(),
    () => undefined,
  );
}

/**
 * Hook to call server tools from the UI
 */
export function useMcpServerTool() {
  return async (name: string, args: Record<string, unknown>) => {
    return await mcpApp.callServerTool(name, args);
  };
}

/**
 * Hook to update model context (send messages to AI)
 */
export function useMcpModelContext() {
  return async (text: string) => {
    return await mcpApp.updateModelContext(text);
  };
}

/**
 * Legacy hook for backward compatibility during migration
 * @deprecated Use useMcpToolOutput instead
 */
export function useOpenAiGlobal(key: 'toolOutput'): ToolOutput | undefined;
export function useOpenAiGlobal(key: string): any {
  if (key === 'toolOutput') {
    return useMcpToolOutput();
  }
  console.warn(`useOpenAiGlobal('${key}') is deprecated. Use MCP App hooks instead.`);
  return undefined;
}
