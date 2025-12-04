import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync } from "node:fs";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

// Create an MCP server
const server = new McpServer({ name: "pokedex", version: "1.0.0" });

// Load locally built assets (produced by your component build)
const JS = readFileSync("../web/dist/component.js", "utf8");
// const JS_FRONT = readFileSync("../web/dist/component-front.js", "utf8");

// UI resource (no inline data assignment; host will inject data)
server.registerResource(
  "pokedex-widget", // Nombre único del recurso
  "ui://widget/pokedex.html", // URI del recurso
  {
    title: "Pokedex", // Título del recurso
    description: "Get a list of Pokemon", // Descripción del recurso
  },
  async () => ({
    contents: [
      {
        uri: "ui://widget/pokedex.html", // URI del contenido, debe coincidir con el recurso
        mimeType: "text/html+skybridge", // Tipo MIME del contenido
        text: `
          <div id="root"></div>
          <script type="module">
            ${JS}
          </script>
        `.trim(), // Contenido HTML con el script embebido
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

// server.registerResource(
//   "pokedex-front-widget",
//   "ui://widget/pokedex-front.html",
//   {
//     title: "Pokedex Frontend",
//     description: "Get a Frontend Pokemon list",
//   },
//   async () => ({
//     contents: [
//       {
//         uri: "ui://widget/pokedex-front.html",
//         mimeType: "text/html+skybridge",
//         text: `
//           <div id="root"></div>
//           <script type="module">
//             ${JS_FRONT}
//           </script>
//         `.trim(),
//         _meta: {
//           "openai/widgetPrefersBorder": true,
//           "openai/widgetDomain": "https://chatgpt.com",
//           "openai/widgetCSP": {
//             connect_domains: ["https://chatgpt.com", "https://pokeapi.co"],
//             resource_domains: [
//               "https://*.oaistatic.com",
//               "https://raw.githubusercontent.com",
//             ],
//           },
//         },
//       },
//     ],
//   })
// );

server.registerTool(
  "pokedex-json-list",
  {
    title: "Show JSON Pokemon list",
    inputSchema: { number: z.string().describe("Number of pokemon to list") },
  },
  async ({ number }) => {
    console.error("🔔 Pokedex JSON tool invoked");
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

    return {
      content: [{ type: "text", text: JSON.stringify(pokemonDetail) }],
    };
  }
);

server.registerTool(
  "pokedex-list", // Nombre de la herramienta
  {
    title: "Show Pokemon list", // Título de la herramienta
    _meta: {
      "openai/outputTemplate": "ui://widget/pokedex.html", // URI del recurso, debe coincidir con el registrado
      // labels to display in ChatGPT when the tool is called
      "openai/toolInvocation/invoking": "Displaying the board",
      "openai/toolInvocation/invoked": "Displayed the board",
    },
    inputSchema: {
      number: z.string().describe("Number of pokemon to list"), // Definimos tipo string y descripción para facilitar a ChatGPT la identificación
    }, // Parametros de entrada
  },
  async ({ number }) => {
    // Callback de la herramienta
    console.error("🔔 Pokedex tool invoked");
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
        { type: "text", text: `Aquí tienes los ${limit} Pokémon solicitados.` }, // Mensaje que mandamos a chatgpt para mayor contexto
      ],
      structuredContent: {
        pokemonList: pokemonDetail.map((p: any) => ({
          id: p.id,
          name: p.name,
          types: p.types,
          img: p.sprites.front_default,
        })),
        tool: "pokedex-list",
      }, // Datos estructurados que mandamos al componente UI
    };
  }
);

// server.registerTool(
//   "pokedex-front-list",
//   {
//     title: "Show Pokemon list in Frontend",
//     _meta: {
//       "openai/outputTemplate": "ui://widget/pokedex-front.html",
//       "openai/toolInvocation/invoking": "Displaying the board",
//       "openai/toolInvocation/invoked": "Displayed the board",
//     },
//     inputSchema: { number: z.string().describe("Number of pokemon to list") },
//   },
//   async ({ number }) => {
//     console.error("🔔 Pokedex Front tool invoked");
//     return {
//       content: [
//         {
//           type: "text",
//           text: `Aquí tienes los ${number} Pokémon solicitados.`,
//         },
//       ],
//       structuredContent: {
//         pokemonNumber: number,
//         tool: "pokedex-front-list",
//       },
//     };
//   }
// );

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
