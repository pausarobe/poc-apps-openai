import express from 'express';
import type { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

export function createHttpApp(transport: StreamableHTTPServerTransport) {
  const app = express();

  app.use(express.json());

  app.all('/mcp', async (req: any, res: any) => {
    await transport.handleRequest(req, res, req.body);
  });

  return app;
}

export function startHttpServer(app: express.Express, port: number | string) {
  app.listen(port, () => console.error(`MCP listening on http://localhost:${port}/mcp`));
}
