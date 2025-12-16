import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

export function createRegisterTool(server: McpServer) {
  return server.registerTool as unknown as (
    name: string,
    def: {
      title: string;
      description: string;
      inputSchema?: unknown;
      _meta?: Record<string, unknown>;
    },
    handler: (args: any, extra: any) => any,
  ) => void;
}

export function makeWidgetHtml(js: string) {
  return `<div id="root"></div><script type="module">${js}</script>`.trim();
}
