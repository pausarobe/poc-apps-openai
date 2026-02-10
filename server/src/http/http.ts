import express from 'express';
import type { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { EventEmitter } from 'node:events';

export function createHttpApp(transport: StreamableHTTPServerTransport, server: any) {
  const app = express();
  app.use(express.json());

  const broadcaster = new EventEmitter();
  broadcaster.setMaxListeners(0);

  let masterConnected = false;
  let masterConnecting = false;

  async function waitForMasterUnlock() {
    while (masterConnecting) await new Promise((r) => setTimeout(r, 10));
  }

  app.get("/mcp/watch", (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.flushHeaders?.();

    const onChunk = (chunk: any) => {
      const payload = typeof chunk === "string" ? chunk : chunk.toString();
      res.write(`data: ${payload}\n\n`);
    };

    const onError = (err: any) => {
      res.write(`event: error\ndata: ${JSON.stringify({ message: String(err) })}\n\n`);
    };

    broadcaster.on("model-chunk", onChunk);
    broadcaster.on("transport-error", onError);

    req.on("close", () => {
      broadcaster.off("model-chunk", onChunk);
      broadcaster.off("transport-error", onError);
      try { res.end(); } catch {}
    });
  });

  app.all("/mcp", async (req: any, res: any) => {
    const wantsSse =
      req.method === "GET" &&
      (req.headers.accept?.includes("text/event-stream") ||
        req.headers["user-agent"]?.includes("curl"));

    if (wantsSse) {
      await waitForMasterUnlock();

      if (masterConnected) {
        res.status(409).json({ error: "Master SSE already connected. Use GET /mcp/watch" });
        return;
      }

      masterConnecting = true;
      masterConnected = true;

      const origWrite = res.write.bind(res);
      const origEnd = res.end.bind(res);

      res.write = (chunk: any, encoding?: any, cb?: any) => {
        try { broadcaster.emit("model-chunk", chunk); } catch {}
        return origWrite(chunk, encoding, cb);
      };

      res.end = (chunk?: any, encoding?: any, cb?: any) => {
        if (chunk) {
          try { broadcaster.emit("model-chunk", chunk); } catch {}
        }
        masterConnected = false;
        setImmediate(() => broadcaster.emit("transport-closed"));
        return origEnd(chunk, encoding, cb);
      };

      req.on("close", () => {
        masterConnected = false;
        broadcaster.emit("transport-closed");
      });

      masterConnecting = false;

      try {
        await transport.handleRequest(req, res, req.body);
      } catch (err) {
        broadcaster.emit("transport-error", err);
        try { res.end(); } catch {}
      } finally {
        masterConnected = false;
      }
      return;
    }

    try {
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      res.status(500).end(String(err));
    }
  });

  app.get("/mcp/health", (_, res) => res.json({ ok: true, masterConnected }));
  return app;
}

export function startHttpServer(app: express.Express, port: number | string) {
  app.listen(port, () => console.error(`MCP listening on http://localhost:${port}/mcp`));
}
