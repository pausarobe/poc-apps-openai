import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { createRegisterTool } from './utils/helpers.js';
import { loadWebAssets } from './utils/assets.js';
import { registerResources } from './resources/index.js';
import { registerTools } from './tools/index.js';
import { createMcpTransport } from './http/transport.js';
import { createHttpApp, startHttpServer } from './http/http.js';

// Create an MCP server
const server = new McpServer({ name: "NTT Flight's", version: '1.0.0' });

// Load locally built assets (produced by your component build)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');
const WEB_DIST = join(PROJECT_ROOT, 'web/dist');

// Register resources
registerResources(server, loadWebAssets(WEB_DIST));

// Register tools
registerTools(createRegisterTool(server));

// Server
const transport = createMcpTransport();
server.connect(transport);

const app = createHttpApp(transport);
const PORT = process.env.PORT || 3333;
startHttpServer(app, PORT);
