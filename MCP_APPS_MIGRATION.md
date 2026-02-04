# Migration to MCP Apps Standard SDK

This document describes the migration from the OpenAI Apps SDK to the standard Model Context Protocol (MCP) Apps SDK.

## Overview

The project has been successfully migrated from the OpenAI-specific Apps SDK to the official MCP Apps standard (`@modelcontextprotocol/ext-apps`). This enables the UI to work across multiple MCP clients:

- ✅ **Visual Studio Code** (VS Code Insiders)
- ✅ **Claude** (Desktop and Web)
- ✅ **ChatGPT**
- ✅ **Goose**
- ✅ Other MCP-compliant clients

## What Changed

### 1. Server-Side Changes

#### Tool Definitions
**Before (OpenAI SDK):**
```typescript
_meta: {
  'openai/outputTemplate': 'ui://widget/car-dashboard.html',
  'openai/toolInvocation/invoking': 'Loading...',
  'openai/toolInvocation/invoked': 'Loaded',
}
```

**After (MCP Apps Standard):**
```typescript
_meta: {
  ui: {
    resourceUri: 'ui://widget/car-dashboard.html'
  }
}
```

#### Resource Registrations
**Before:**
```typescript
{
  uri: 'ui://widget/car-dashboard.html',
  mimeType: 'text/html+skybridge',
  text: makeWidgetHtml(js, css),
  _meta: {
    'openai/widgetPrefersBorder': true,
    'openai/widgetDomain': 'https://chatgpt.com',
    'openai/widgetCSP': { ... },
  }
}
```

**After:**
```typescript
{
  uri: 'ui://widget/car-dashboard.html',
  mimeType: 'text/html',
  text: makeWidgetHtml(js, css),
}
```

### 2. Client-Side Changes

#### New MCP App Wrapper ([mcp-app.ts](web/src/lib/mcp-app.ts))
Created a wrapper class around the `App` SDK that:
- Initializes `PostMessageTransport` for iframe communication
- Handles `ontoolresult` notifications
- Provides helper methods for common operations

#### Updated Hooks ([hooks.ts](web/src/lib/hooks.ts))
**Before:**
```typescript
const toolOutput = useOpenAiGlobal('toolOutput');
```

**After:**
```typescript
const toolOutput = useMcpToolOutput();
```

New hooks available:
- `useMcpToolOutput()` - Access tool results
- `useMcpServerTool()` - Call server tools from UI
- `useMcpModelContext()` - Update model context

#### UI Components
Updated to use:
- `mcpApp.sendMessage()` instead of `window.openai.sendFollowUpMessage()`
- Standard MCP Apps API patterns

### 3. Type Updates

- Moved `ToolOutput` interface to [types.ts](web/src/lib/types.ts)
- Removed OpenAI-specific global type declarations
- Added proper MCP Apps type support

## Installation & Setup

### Prerequisites
```bash
# Install dependencies
cd /absolute/path/to/poc-apps-openai
npm install

# Build the project
cd server && npm run build
cd ../web && npm run build
```

### Running the Server

The server automatically uses the correct transport mode:

**Stdio Mode (Default)** - For MCP clients:
```bash
cd server
npm start
```

**HTTP Mode** - For development/testing:
```bash
cd server
npm run start:http
# Access at: http://localhost:3333/mcp
```

The server detects the mode via the `MCP_HTTP` environment variable.

## Testing in VS Code

### 1. Configure VS Code MCP Settings

Create or update your VS Code MCP settings file:

**macOS:** `~/Library/Application Support/Code - Insiders/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

**Windows:** `%APPDATA%\Code - Insiders\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

**Linux:** `~/.config/Code - Insiders/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "ntt-flights": {
      "command": "node",
      "args": [
        "/absolute/path/to/poc-apps-openai/server/dist/index.js"
      ],
      "env": {
        "PROVIDER_API_KEY": "your-api-key-here",
        "PROVIDER_CARS_API_KEY": "your-magento-token-here"
      }
    }
  }
}
```

**Note:** Adjust the path to match your system.

### 2. Test in VS Code

1. **Open VS Code Insiders** (MCP Apps support is in Insiders only)
2. **Open the Claude Dev extension**
3. **Restart MCP servers** or reload VS Code
4. **Ask Claude:**
   - "Show me the car rental catalog" → Should display `car-dashboard` UI
   - "Show me flight details for flight IB3141" → Should display `flight-detail` UI
   - "Show me car details for SKU PROD-001" → Should display `car-detail` UI

### 3. Verify UI Rendering

When a tool with a UI is called, you should see:
- The tool executes and returns data
- An interactive iframe renders in the chat panel
- The UI displays your data (cars, flights, etc.)
- Interactive elements work (buttons, cards, etc.)

## Testing in Claude Desktop

### 1. Configure Claude Desktop

Edit your Claude Desktop configuration:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ntt-flights": {
      "command": "node",
      "args": [
        "/absolute/path/to/poc-apps-openai/server/dist/index.js"
      ],
      "env": {
        "PROVIDER_API_KEY": "your-api-key-here",
        "PROVIDER_CARS_API_KEY": "your-magento-token-here"
      }
    }
  }
}
```

### 2. Test in Claude

1. **Restart Claude Desktop**
2. **Ask Claude:**
   - "Show me available rental cars"
   - "Show me train schedules for Madrid"
   - "Show me flight details"

The UIs should render inline in the conversation.

## Available Tools

### Flight Tools
- **flight-dashboard** - Display arrivals/departures dashboard
- **flight-detail** - Show detailed flight information

### Car Rental Tools
- **car-dashboard** - Browse rental car catalog
- **car-detail** - View detailed car specifications
- **car-create** - Create new rental car entries

### Train Tools
- **train-dashboard** - View train schedules

## Architecture

```
┌─────────────────────────────────────────┐
│         MCP Client (VSCode/Claude)       │
│  ┌───────────────────────────────────┐  │
│  │   Chat Interface                  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Sandboxed iframe           │  │  │
│  │  │  ┌─────────────────────┐    │  │  │
│  │  │  │  React UI App       │    │  │  │
│  │  │  │  - Uses App SDK     │    │  │  │
│  │  │  │  - PostMessage comm │    │  │  │
│  │  │  └─────────────────────┘    │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│           ↕ JSON-RPC over stdio          │
└─────────────────────────────────────────┘
               ↕
┌─────────────────────────────────────────┐
│         MCP Server (Node.js)            │
│  - Registers tools with ui.resourceUri  │
│  - Serves UI resources (text/html)      │
│  - Handles tool calls                   │
│  - Returns structured data              │
└─────────────────────────────────────────┘
```

## Key Benefits

1. **Cross-Platform:** Works in VSCode, Claude, ChatGPT, and other MCP clients
2. **Standard Protocol:** Uses official MCP specification
3. **Security:** Sandboxed iframes with host-controlled CSP
4. **Maintainability:** Vendor-neutral, community-supported standard

## Troubleshooting

### UI Not Rendering

1. **Check MCP server is running:**
   ```bash
   # Look for the server in VSCode MCP panel or Claude settings
   ```

2. **Check tool registration:**
   - Tools should have `_meta.ui.resourceUri` set
   - Resources should use `text/html` MIME type

3. **Check browser console** (in VSCode DevTools or Claude):
   - MCP App should log "✅ MCP App connected successfully"
   - Check for connection errors

### Tool Result Not Showing

1. **Verify `structuredContent` is returned:**
   ```typescript
   return {
     content: [{ type: 'text', text: 'Success message' }],
     structuredContent: { carList: [...] }
   };
   ```

2. **Check data structure** matches UI expectations

### TypeScript Errors

1. **Rebuild after changes:**
   ```bash
   cd web && npm run build
   cd ../server && npm run build
   ```

2. **Clear node_modules if needed:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Further Reading

- [MCP Apps Documentation](https://modelcontextprotocol.io/docs/extensions/apps)
- [MCP Apps Quickstart](https://modelcontextprotocol.github.io/ext-apps/api/documents/Quickstart.html)
- [MCP Apps SDK (@modelcontextprotocol/ext-apps)](https://www.npmjs.com/package/@modelcontextprotocol/ext-apps)
- [MCP Apps Examples](https://github.com/modelcontextprotocol/ext-apps/tree/main/examples)
- [MCP Apps Announcement](http://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)

## Migration Checklist

- ✅ Installed `@modelcontextprotocol/ext-apps` package
- ✅ Updated tool definitions (removed OpenAI-specific metadata)
- ✅ Updated resource registrations (standard MIME type)
- ✅ Created MCP App wrapper class
- ✅ Updated React hooks to use new API
- ✅ Updated UI components to use MCP Apps methods
- ✅ Removed OpenAI-specific type declarations
- ✅ Built and tested successfully

## Support

For issues specific to this implementation, check the codebase:
- Server code: [server/src/](server/src/)
- Client code: [web/src/](web/src/)
- MCP App wrapper: [web/src/lib/mcp-app.ts](web/src/lib/mcp-app.ts)

For MCP Apps SDK issues:
- [MCP Apps GitHub Issues](https://github.com/modelcontextprotocol/ext-apps/issues)
- [MCP Discord Community](https://discord.gg/modelcontextprotocol)
