import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync } from "node:fs";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

// Create an MCP server
const server = new McpServer({ name: "pokedex", version: "1.0.0" });

// Load locally built assets (produced by your component build)
const JS = readFileSync("../web/dist/component.js", "utf8");

// UI resource (no inline data assignment; host will inject data)
server.registerResource(
  "pokedex-widget",
  "ui://widget/pokedex.html",
  {
    title: "Pokedex",
    description: "Get a list of Pokemon",
  },
  async () => ({
    contents: [
      {
        uri: "ui://widget/pokedex.html",
        mimeType: "text/html+skybridge",
        text: `
          <div id="root"></div>
          <script type="module">
            ${JS}
          </script>
        `.trim(),
        _meta: {
          "openai/widgetPrefersBorder": true,
          "openai/widgetDomain": "https://chatgpt.com",
          "openai/widgetCSP": {
            connect_domains: ["https://chatgpt.com", "https://pokeapi.co"],
            resource_domains: [
              "https://*.oaistatic.com",
              "https://raw.githubusercontent.com",
            ],
          },
        },
      },
    ],
  })
);

server.registerTool(
  "pokedex-list",
  {
    title: "Show Pokemon list",
    _meta: {
      "openai/outputTemplate": "ui://widget/pokedex.html",
      "openai/toolInvocation/invoking": "Displaying the board",
      "openai/toolInvocation/invoked": "Displayed the board",
    },
    inputSchema: { number: z.string().describe("Number of pokemon to list") },
  },
  async ({ number }) => {
    console.error("Pokedex tool invoked");
    const limit = number || "20";
    let pokemonDetail: any;

    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${limit}`
      );
      const data: any = await res.json();
      pokemonDetail = await Promise.all(
        data.results.map(async (p: any) => {
          const res = await fetch(p.url);
          return res.json();
        })
      );
    } catch (error) {
      console.error("Error fetching pokemons:", error);
    }

    console.error("📤 Returning tool structuredContent");
    return {
      content: [
        { type: "text", text: `Aquí tienes los ${limit} Pokémon solicitados.` },
      ],
      structuredContent: {
        pokemonList: pokemonDetail.map((p: any) => ({
          id: p.id,
          name: p.name,
          types: p.types,
          img: p.sprites.front_default,
        })),
        tool: "pokedex-list",
      },
    };
  }
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

app.all("/mcp", async (req: any, res: any) => {
  console.error("\n🟦 Incoming MCP Request:");
  console.error(JSON.stringify(req.body, null, 2));
  await transport.handleRequest(req, res, req.body);
  console.error("🟩 Outgoing MCP Response:", res.locals?.mcpResponse);
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () =>
  console.error(`MCP listening on http://localhost:${PORT}/mcp`)
);
