import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createRegisterTool, makeWidgetHtml } from './helpers.js';

// Create an MCP server
const server = new McpServer({ name: 'pokedex', version: '1.0.0' });

// Load locally built assets (produced by your component build)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

const WEB_DIST = join(PROJECT_ROOT, 'web/dist');
const JS = readFileSync(join(WEB_DIST, 'component.js'), 'utf8');
const JS_DETAIL = readFileSync(join(WEB_DIST, 'pokemon-detail.js'), 'utf8');

// UI resources
server.registerResource(
  'pokedex-widget',
  'ui://widget/pokedex.html',
  {
    title: 'Pokedex',
    description: 'Get a list of Pokemon',
  },
  async () => ({
    contents: [
      {
        uri: 'ui://widget/pokedex.html',
        mimeType: 'text/html+skybridge',
        text: makeWidgetHtml(JS),
        _meta: {
          'openai/widgetPrefersBorder': true,
          'openai/widgetDomain': 'https://chatgpt.com',
          'openai/widgetCSP': {
            connect_domains: ['https://chatgpt.com', 'https://pokeapi.co'],
            resource_domains: ['https://*.oaistatic.com', 'https://raw.githubusercontent.com'],
          },
        },
      },
    ],
  }),
);

server.registerResource(
  'pokemon-detail-widget',
  'ui://widget/pokemon-detail.html',
  {
    title: 'Pokemon detail',
    description: 'Detail of a Pokemon',
  },
  async () => ({
    contents: [
      {
        uri: 'ui://widget/pokemon-detail.html',
        mimeType: 'text/html+skybridge',
        text: makeWidgetHtml(JS_DETAIL),
        _meta: {
          'openai/widgetPrefersBorder': false,
          'openai/widgetDomain': 'https://chatgpt.com',
          'openai/widgetCSP': {
            connect_domains: ['https://chatgpt.com', 'https://pokeapi.co'],
            resource_domains: ['https://*.oaistatic.com', 'https://raw.githubusercontent.com'],
          },
        },
      },
    ],
  }),
);

// Register tools
const registerTool = createRegisterTool(server);

registerTool(
  'pokedex-list',
  {
    title: 'List of Pokemons',
    description: 'Show a defined number of Pokemons.',
    _meta: {
      'openai/outputTemplate': 'ui://widget/pokedex.html',
      'openai/toolInvocation/invoking': 'Displaying the board',
      'openai/toolInvocation/invoked': 'Displayed the board',
    },
    inputSchema: {
      number: z.coerce.number().int().min(1).max(200).describe('Number of pokemon to list'),
    },
  },
  async ({ number }) => {
    console.error('Pokedex tool invoked');
    const limit = number;
    let pokemonDetail: any[] = [];

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
      const data: any = await res.json();
      pokemonDetail = await Promise.all(
        data.results.map(async (p: any) => {
          const res = await fetch(p.url);
          return res.json();
        }),
      );
    } catch (error) {
      console.error('Error fetching pokemons:', error);
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Aquí tienes los ${limit} Pokémon solicitados.`,
        },
      ],
      structuredContent: {
        pokemonList: pokemonDetail.map((p: any) => ({
          id: p.id,
          name: p.name,
          types: p.types,
          img: p.sprites.front_default,
        })),
        tool: 'pokedex-list',
      },
    };
  },
);

registerTool(
  'get-pokemon',
  {
    title: 'Get Pokemon',
    description: 'Get the name and the detail url of all Pokemons',
  },
  async () => {
    console.error('Get pokemon tool invoked');
    let data: any;

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=151`);
      data = await res.json();
    } catch (error) {
      console.error('Error fetching pokemons:', error);
      return {
        content: [{ type: 'text' as const, text: 'Error fetching pokemons' }],
      };
    }

    const pokemons = data?.results ?? [];

    return {
      content: [
        {
          type: 'text',
          text: `I found ${pokemons.length} pokemons. Use their URLs with the get-pokemon-detail tool.`,
        },
      ],
      structuredContent: { pokemons },
    };
  },
);

registerTool(
  'get-pokemon-detail',
  {
    title: 'Get Pokemon detail',
    description: 'Get the detail of one pokemon using PokeAPI. Use the url field returned by get-pokemon.',
    _meta: {
      'openai/outputTemplate': 'ui://widget/pokemon-detail.html',
    },
    inputSchema: { url: z.string().describe('The url where find the detail') },
  },
  async ({ url }) => {
    console.error('Get pokemon detail tool invoked');
    let pokemonDetail: any;

    try {
      const res = await fetch(url);
      pokemonDetail = await res.json();
    } catch (error) {
      console.error('Error fetching pokemons:', error);
      return {
        content: [{ type: 'text' as const, text: 'Error fetching pokemon detail' }],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Ok, aquí tienes el detalle de ${pokemonDetail.name}.`,
        },
      ],
      structuredContent: { pokemonDetail },
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

app.all('/mcp', async (req: any, res: any) => {
  // console.error("\n🟦 Incoming MCP Request:");
  // console.error(JSON.stringify(req.body, null, 2));
  await transport.handleRequest(req, res, req.body);
  // console.error("🟩 Outgoing MCP Response:", res.locals?.mcpResponse);
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.error(`MCP listening on http://localhost:${PORT}/mcp`));
