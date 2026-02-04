# MCP Apps POC - Testing Guide

This guide walks you through testing the MCP Apps implementation in VS Code and Claude Desktop.

## Prerequisites

1. **Build the project:**
   ```bash
   cd /absolute/path/to/poc-apps-openai
   cd server && npm install && npm run build
   cd ../web && npm install && npm run build
   ```

2. **Verify server starts correctly:**
   ```bash
   cd /absolute/path/to/poc-apps-openai/server
   # Test stdio mode (should show "MCP server started with stdio transport")
   timeout 2 npm start 2>&1 | grep "stdio transport" && echo "✅ Server OK"
   ```

3. **Have VS Code Insiders installed** (for VSCode testing)
   - Download: https://code.visualstudio.com/insiders/

4. **Have Claude Desktop installed** (for Claude testing)
   - Download: https://claude.ai/download

## Testing in Visual Studio Code

### Step 1: Install Claude Dev Extension

1. Open VS Code Insiders
2. Go to Extensions (⌘+Shift+X)
3. Search for "Claude Dev" or "Cline"
4. Install the extension

### Step 2: Configure MCP Server

1. **Find your MCP settings file location:**
   - macOS: `~/Library/Application Support/Code - Insiders/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Windows: `%APPDATA%\Code - Insiders\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
   - Linux: `~/.config/Code - Insiders/User/globalStorage/saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

2. **Create/edit the file:**
   ```bash
   # macOS/Linux
   mkdir -p "~/Library/Application Support/Code - Insiders/User/globalStorage/saoudrizwan.claude-dev/settings"
   nano "~/Library/Application Support/Code - Insiders/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"
   ```

3. **Add this configuration** (adjust the path):
   ```json
   {
     "mcpServers": {
       "ntt-flights": {
         "command": "node",
         "args": [
           "/absolute/path/to/poc-apps-openai/server/dist/index.js"
         ],
         "env": {
           "PROVIDER_API_KEY": "your-api-key",
           "PROVIDER_CARS_API_KEY": "your-magento-token"
         }
       }
     }
   }
   ```

### Step 3: Restart and Verify

1. **Reload VS Code:** Press `⌘+Shift+P` (Ctrl+Shift+P on Windows), type "Reload Window"
2. **Open Claude Dev panel:** Click the Claude icon in the sidebar
3. **Check MCP servers:** You should see "ntt-flights" listed in available servers
4. **Verify tools:** The following tools should be available:
   - `flight-dashboard`
   - `flight-detail`
   - `car-dashboard`
   - `car-detail`
   - `car-create`
   - `train-dashboard`

### Step 4: Test Interactive UIs

**Test 1: Car Catalog**
```
Ask Claude: "Show me the car rental catalog"
```
Expected: 
- Tool `car-dashboard` is called
- Interactive UI appears showing a grid of cars
- Each car shows image, name, price, motor type
- KPI cards display total models, average price, eco-friendly count

**Test 2: Flight Detail**
```
Ask Claude: "Show me details for flight IB3141"
```
Expected:
- Tool `flight-detail` is called
- Detailed flight card appears with:
  - Departure/arrival airports and times
  - Flight status badge
  - Aircraft information
  - Weather info for destination
  - Interactive buttons

**Test 3: Car Detail**
```
Ask Claude: "Show me technical details for car PROD-001"
```
Expected:
- Tool `car-detail` is called
- Detailed car specification card with:
  - Image gallery
  - Technical specs (motor type, power, etc.)
  - Rental costs breakdown
  - Interactive elements

**Test 4: Create Car**
```
Ask Claude: "I want to register a new car"
```
Expected:
- Tool `car-create` is called
- Form appears (or success card if data provided)
- Can fill in details and submit

**Test 5: Train Dashboard**
```
Ask Claude: "Show me train schedules for Madrid"
```
Expected:
- Tool `train-dashboard` is called
- List of train routes with times and stations

### Step 5: Verify Interactions

Try these interactions within the UIs:

1. **In car-dashboard:** Hover over cars, click "Ver Detalles" buttons
2. **In flight-detail:** Click weather card, interact with "Buscar coches" button
3. **Check responsiveness:** Resize the panel to see responsive layouts

## Testing in Claude Desktop

### Step 1: Configure Claude Desktop

1. **Find Claude config location:**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Create/edit the configuration:**
   ```bash
   # macOS
   mkdir -p "~/Library/Application Support/Claude"
   nano "~/Library/Application Support/Claude/claude_desktop_config.json"
   ```

3. **Add this configuration:**
   ```json
   {
     "mcpServers": {
       "ntt-flights": {
         "command": "node",
         "args": [
           "/absolute/path/to/poc-apps-openai/server/dist/index.js"
         ],
         "env": {
           "PROVIDER_API_KEY": "your-api-key",
           "PROVIDER_CARS_API_KEY": "your-magento-token"
         }
       }
     }
   }
   ```

### Step 2: Restart Claude Desktop

1. **Quit Claude Desktop completely:** `⌘+Q` (Cmd+Q) on macOS
2. **Restart Claude Desktop**
3. **Look for MCP indicator:** Should show "ntt-flights" server connected

### Step 3: Test in Claude

Use the same test prompts as in VS Code:

1. "Show me the car rental catalog"
2. "Show me flight details for IB3141"
3. "Show me train schedules"
4. "I want to register a new car"

The UIs should render inline in the conversation.

## Debugging

### If UIs Don't Appear

1. **Check server path is absolute:**
   ```bash
   # Get absolute path
   cd /absolute/path/to/poc-apps-openai/server
   pwd
   # Output: /absolute/path/to/poc-apps-openai/server
   ```

2. **Check server runs manually:**
   ```bash
   cd /absolute/path/to/poc-apps-openai/server
   node dist/index.js
   # Should start without errors
   ```

3. **Check build is up to date:**
   ```bash
   cd /absolute/path/to/poc-apps-openai
   cd server && npm run build
   cd ../web && npm run build
   ```

4. **Check logs:**
   - VS Code: Open Developer Tools (Help → Toggle Developer Tools)
   - Claude: Check console for errors

### If Tools Don't Appear

1. **Verify config file location:**
   ```bash
   # macOS - VS Code
   cat "~/Library/Application Support/Code - Insiders/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"
   
   # macOS - Claude
   cat "~/Library/Application Support/Claude/claude_desktop_config.json"
   ```

2. **Check JSON syntax:** Use a JSON validator

3. **Restart the application completely**

### If Data Doesn't Load

1. **Check mock data exists:**
   ```bash
   ls -la /absolute/path/to/poc-apps-openai/server/src/mock/
   # Should show: cars.mock.ts, data.ts, etc.
   ```

2. **Check structured content is returned:**
   - Tools should return `structuredContent` in addition to `content`

### Common Issues

**Issue:** "Waiting for server to respond to `initialize` request..."
- **Cause:** Server was using HTTP transport instead of stdio
- **Solution:** ✅ **FIXED!** Server now uses stdio by default. Rebuild with `npm run build`

**Issue:** "Tool not found"
- **Solution:** Restart the client, check server logs for registration errors

**Issue:** "UI shows blank iframe"
- **Solution:** Check browser console for errors, verify web build succeeded

**Issue:** "Connection failed"
- **Solution:** Check absolute paths in config, verify Node.js version (16+)

**Issue:** "Permission denied"
- **Solution:** Check file permissions on dist/index.js

## Verification Checklist

- [ ] Server builds without errors
- [ ] Web builds without errors
- [ ] MCP config file exists in correct location
- [ ] Absolute path is correct in config
- [ ] VS Code/Claude shows MCP server connected
- [ ] Tools are listed in available tools
- [ ] Car dashboard UI renders correctly
- [ ] Flight detail UI renders correctly
- [ ] Interactive elements work (buttons, hovers)
- [ ] Data loads in UI components
- [ ] No console errors

## Success Criteria

✅ **Implementation is working if:**
1. MCP server connects successfully
2. Tools appear in the client
3. UIs render in iframes when tools are called
4. Data from tools displays in the UI
5. Interactive elements respond to clicks
6. No JavaScript errors in console
7. UIs adapt to different viewport sizes

## Next Steps

Once tested successfully:
1. **Document your specific setup** for your team
2. **Customize the UIs** in web/src/entries/
3. **Add real API endpoints** in server/src/tools/
4. **Deploy to production** server if needed

## Support

- MCP Apps Docs: https://modelcontextprotocol.io/docs/extensions/apps
- Issues: Check MCP_APPS_MIGRATION.md for troubleshooting
- Examples: https://github.com/modelcontextprotocol/ext-apps/tree/main/examples
