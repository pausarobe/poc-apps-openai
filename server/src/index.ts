import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createRegisterTool, makeWidgetHtml } from './helpers.js';

// Create an MCP server
const server = new McpServer({ name: "NTT Flight's", version: '1.0.0' });

// Load locally built assets (produced by your component build)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

const WEB_DIST = join(PROJECT_ROOT, 'web/dist');
const JS = readFileSync(join(WEB_DIST, 'component.js'), 'utf8');
const JS_TEST = readFileSync(join(WEB_DIST, 'test.js'), 'utf8');

// UI resources

server.registerResource(
  'aviation-widget',
  'ui://widget/aviation.html',
  {
    title: 'Aviation',
    description: 'Get a list of Airplanes',
  },
  async () => ({
    contents: [
      {
        uri: 'ui://widget/aviation.html',
        mimeType: 'text/html+skybridge',
        text: makeWidgetHtml(JS),
        _meta: {
          'openai/widgetPrefersBorder': true,
          'openai/widgetDomain': 'https://chatgpt.com',
          'openai/widgetCSP': {
            connect_domains: ['https://chatgpt.com', 'https://api.aviationstack.com'],
            resource_domains: ['https://*.oaistatic.com', 'https://raw.githubusercontent.com'],
          },
        },
      },
    ],
  }),
);

server.registerResource(
  'flight-test-widget',
  'ui://widget/flighttest.html',
  {
    title: 'Flighttest',
    description: 'Get a list of testing flights',
  },
  async () => ({
    contents: [
      {
        uri: 'ui://widget/flighttest.html',
        mimeType: 'text/html+skybridge',
        text: makeWidgetHtml(JS_TEST),
        _meta: {
          'openai/widgetPrefersBorder': true,
          'openai/widgetDomain': 'https://chatgpt.com',
          'openai/widgetCSP': {
            connect_domains: ['https://chatgpt.com'],
            resource_domains: ['https://*.oaistatic.com'],
          },
        },
      },
    ],
  }),
);

// Register tools
const registerTool = createRegisterTool(server);

registerTool(
  'airplane-list',
  {
    title: 'List of Airplanes',
    description: 'Show a defined number of Airplanes.',
    _meta: {
      'openai/outputTemplate': 'ui://widget/aviation.html',
      'openai/toolInvocation/invoking': 'Displaying the board',
      'openai/toolInvocation/invoked': 'Displayed the board',
    },
    inputSchema: {
      number: z.coerce.number().int().min(1).max(200).describe('Number of airplane to list'),
    },
  },
  async ({ number }) => {
    console.error('Aviation tool invoked');
    const limit = number;
    let airplaneDetail: any[] = [];

    try {
      console.log(`Fetching airplanes from AviationStack API https://api.aviationstack.com/v1/airplanes?access_key=${process.env.PROVIDER_API_KEY}&limit=${limit}`);
      const res = await fetch(`https://api.aviationstack.com/v1/airplanes?access_key=${process.env.PROVIDER_API_KEY}&limit=${limit}`);
      const data: any = await res.json();
      airplaneDetail = await Promise.all(
        data.results.map(async (p: any) => {
          const res = await fetch(p.url);
          return res.json();
        }),
      );
    } catch (error) {
      console.error('Error fetching airplanes:', error);
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Aquí tienes los ${limit} Aviones solicitados.`,
        },
      ],
      structuredContent: {
        airplaneList: airplaneDetail.map((p: any) => ({
          //TODO: revisar
          iata_code_long: p.iata_code_long,
          production_line: p.production_line,
          model_name: p.model_name,
          // id: p.id,
          // name: p.name,
          // types: p.types,
          // img: p.sprites.front_default,
        })),
        tool: 'airplane-list',
      },
    };
  },
);

registerTool(
  'flight-test-list',
  {
    title: 'List of Testing Flights',
    description: 'Show a defined number of Testing Flights.',
    _meta: {
      'openai/outputTemplate': 'ui://widget/flighttest.html',
      'openai/toolInvocation/invoking': 'Displaying the board',
      'openai/toolInvocation/invoked': 'Displayed the board',
    },
  },
  async () => {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Herramienta de testeo.`,
        },
      ],
      structuredContent: {
        tool: 'flight-test-list',
      },
    };
  },
);

// 6) Transport streamable HTTP (el que soporta Inspector Web)
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
  enableJsonResponse: true,
});
server.connect(transport);

// Endpoint
const app = express();
app.use(express.json());

const PUBLIC_DIR = join(PROJECT_ROOT, 'public');
app.use(express.static(PUBLIC_DIR));

app.all('/mcp', async (req: any, res: any) => {
  // console.error("\n🟦 Incoming MCP Request:");
  // console.error(JSON.stringify(req.body, null, 2));
  await transport.handleRequest(req, res, req.body);
  // console.error("🟩 Outgoing MCP Response:", res.locals?.mcpResponse);
});

app.get('/.well-known/openai-apps-challenge', (_req, res) => {
  res.type('text/plain').send('2rA97WVocB44_0fVNMtWDLeNSoPOLn2EMoH6sP3l0a8');
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.error(`MCP listening on http://localhost:${PORT}/mcp`));
