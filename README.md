# NTT Flights & Car Rental - MCP Apps POC

This is a proof-of-concept application demonstrating the **Model Context Protocol (MCP) Apps** standard for building interactive UIs within AI assistants.

## 🎉 Recent Migration

**This project has been successfully migrated from the OpenAI Apps SDK to the official MCP Apps standard!**

The application now works seamlessly across multiple MCP clients:
- ✅ Visual Studio Code (Insiders)
- ✅ Claude Desktop & Web
- ✅ ChatGPT
- ✅ Goose
- ✅ Any MCP-compliant client

For detailed migration information, see **[MCP_APPS_MIGRATION.md](MCP_APPS_MIGRATION.md)**

## Features

This MCP server provides interactive UI tools for:

### 🛫 Flight Management
- **Flight Dashboard** - View arrivals/departures with live updates
- **Flight Details** - Detailed flight information with weather data

### 🚗 Car Rental System
- **Car Catalog** - Browse available rental vehicles
- **Car Details** - View technical specifications and pricing
- **Car Registration** - Create new vehicles in the catalog

### 🚆 Train Schedules
- **Train Dashboard** - View train schedules and routing

## Quick Start

### Installation

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install web UI dependencies
cd ../web && npm install

# Build everything
cd ../server && npm run build
cd ../web && npm run build
```

### Running the Server

**For MCP Clients (VS Code, Claude, etc.):**

The server runs automatically when configured in your MCP client. It uses stdio transport by default.

**For Manual Testing/Development:**

```bash
cd server

# Standard stdio mode (for MCP clients)
npm start

# HTTP mode (for browser-based testing)
npm run start:http
# Then access: http://localhost:3333/mcp
```

## Testing in VS Code

### 1. Configure MCP Server

Create or update your VS Code MCP settings file:

**macOS:** `~/Library/Application Support/Code - Insiders/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "ntt-flights": {
      "command": "node",
      "args": [
        "/absolute/path/to/poc-apps-openai/server/dist/index.js"
      ],
      "env": {
        "PROVIDER_API_KEY": "your-api-key-if-needed",
        "PROVIDER_CARS_API_KEY": "your-magento-token-if-needed"
      }
    }
  }
}
```

Replace `/absolute/path/to/` with the actual path on your system.

### 2. Test the Tools

In VS Code Insiders with Claude Dev extension:

1. Ask: **"Show me the car rental catalog"**
   - Should invoke `car-dashboard` tool
   - Display interactive grid of rental cars

2. Ask: **"Show me flight details for IB3141"**
   - Should invoke `flight-detail` tool
   - Display flight info with weather

3. Ask: **"Show me car details for PROD-001"**
   - Should invoke `car-detail` tool
   - Display technical specs and pricing

## Testing in Claude Desktop

### 1. Configure Claude

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ntt-flights": {
      "command": "node",
      "args": [
        "/absolute/path/to/poc-apps-openai/server/dist/index.js"
      ]
    }
  }
}
```

### 2. Restart Claude & Test

Ask Claude to show you cars, flights, or train schedules. The UIs will render inline.

## Architecture

```
┌─────────────────────────────────────────┐
│    MCP Client (VSCode, Claude, etc.)     │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │     Sandboxed iframe with UI       │ │
│  │  - React components                │ │
│  │  - Uses @modelcontextprotocol/     │ │
│  │    ext-apps SDK                    │ │
│  │  - PostMessage communication       │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
               ↕ JSON-RPC
┌─────────────────────────────────────────┐
│         MCP Server (Node.js)            │
│  - Registers tools with UI metadata    │
│  - Serves bundled React UIs            │
│  - Handles tool invocations            │
│  - Returns structured data             │
└─────────────────────────────────────────┘
```

## Project Structure

```
poc-apps-openai/
├── server/               # MCP Server
│   ├── src/
│   │   ├── index.ts     # Server entry point
│   │   ├── tools/       # Tool implementations
│   │   ├── resources/   # UI resource registrations
│   │   ├── http/        # HTTP transport (optional)
│   │   ├── mock/        # Mock data
│   │   └── utils/       # Helpers
│   └── package.json
│
├── web/                 # UI Components
│   ├── src/
│   │   ├── entries/     # React app entry points
│   │   │   ├── car-dashboard.tsx
│   │   │   ├── flight-detail.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── mcp-app.ts    # MCP Apps SDK wrapper
│   │   │   ├── hooks.ts      # React hooks
│   │   │   └── types.ts      # TypeScript types
│   │   └── mock/        # Mock data for stories
│   └── package.json
│
├── MCP_APPS_MIGRATION.md    # Detailed migration guide
└── README.md                # This file
```

## Key Technologies

- **[@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)** - MCP server SDK
- **[@modelcontextprotocol/ext-apps](https://www.npmjs.com/package/@modelcontextprotocol/ext-apps)** - MCP Apps SDK for UI
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Flowbite React** - UI components

## Development

### Running in Development Mode

```bash
# Terminal 1: Build and watch web UI
cd web
npm run build

# Terminal 2: Run MCP server
cd server
npm run build && npm start
```

### Viewing UI Components in Isolation

Use Ladle for component development:

```bash
cd web
npm run ladle
```

Visit http://localhost:61000 to see stories.

## Available Tools

| Tool | Description | Output |
|------|-------------|---------|
| `flight-dashboard` | Airport arrivals/departures | Interactive dashboard UI |
| `flight-detail` | Flight details by IATA code | Detailed flight card with weather |
| `car-dashboard` | Rental car catalog | Grid of available vehicles |
| `car-detail` | Car specs by SKU | Technical details & pricing |
| `car-create` | Register new vehicle | Form or confirmation |
| `train-dashboard` | Train schedules | List of train routes |

## Migration from OpenAI SDK

This project was originally built with the OpenAI Apps SDK and has been migrated to the MCP Apps standard. Key changes:

- ✅ Tool metadata: `openai/outputTemplate` → `_meta.ui.resourceUri`
- ✅ Resources: `text/html+skybridge` → `text/html`
- ✅ Client API: `window.openai` → `@modelcontextprotocol/ext-apps`
- ✅ Cross-platform support: Works in VSCode, Claude, ChatGPT, etc.

See **[MCP_APPS_MIGRATION.md](MCP_APPS_MIGRATION.md)** for complete details.

## Troubleshooting

### UI Not Appearing

1. **Check server is running:** The MCP server should show up in your client's MCP panel
2. **Rebuild after changes:** Run `npm run build` in both `server/` and `web/`
3. **Check console logs:** Open DevTools in the MCP client to see connection logs
4. **Verify paths:** Ensure absolute paths in MCP config are correct

### Tool Not Found

1. **Check tool registration:** View available tools in MCP client UI
2. **Restart client:** Some clients cache tool lists
3. **Check server logs:** The server logs tool registrations on startup

### Data Not Loading

1. **Check `structuredContent`:** Tools must return structured content for UI
2. **Check mock data:** Ensure mock data files are present
3. **API keys:** Some features require `PROVIDER_API_KEY` environment variable

## Resources

- 📖 [MCP Apps Documentation](https://modelcontextprotocol.io/docs/extensions/apps)
- 🚀 [MCP Apps Quickstart](https://modelcontextprotocol.github.io/ext-apps/api/documents/Quickstart.html)
- 📦 [MCP Apps SDK Package](https://www.npmjs.com/package/@modelcontextprotocol/ext-apps)
- 💬 [MCP Discord Community](https://discord.gg/modelcontextprotocol)
- 📝 [MCP Apps Announcement Blog](http://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)

## License

ISC
