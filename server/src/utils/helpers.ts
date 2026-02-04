import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

export function createRegisterTool(server: McpServer) {
  const bound = server.registerTool.bind(server);

  return bound as unknown as (
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

export function makeWidgetHtml(js: string, css?: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${css ? `<style>${css}</style>` : ''}
</head>
<body>
  <div id="root"></div>
  <script type="module">${js}</script>
</body>
</html>`.trim();
}

export function errorMessage(text: string) {
  return {
    content: [{ type: 'text' as const, text: text }],
  };
}
