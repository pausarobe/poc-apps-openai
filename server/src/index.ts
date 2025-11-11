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
            <script type="module">${JS}</script>
        `.trim(),
        _meta: {
          "openai/widgetPrefersBorder": true,
          "openai/widgetDomain": "https://chatgpt.com",
          "openai/widgetCSP": {
            connect_domains: ["https://chatgpt.com"],
            resource_domains: ["https://*.oaistatic.com"],
          },
        },
      },
    ],
  })
);

// Register tools
// async function loadKanbanBoard() {
//   const tasks = [
//     {
//       id: "task-1",
//       title: "Design empty states",
//       assignee: "Ada",
//       status: "todo",
//     },
//     {
//       id: "task-2",
//       title: "Wireframe admin panel",
//       assignee: "Grace",
//       status: "in-progress",
//     },
//     {
//       id: "task-3",
//       title: "QA onboarding flow",
//       assignee: "Lin",
//       status: "done",
//     },
//   ];

//   return {
//     columns: [
//       {
//         id: "todo",
//         title: "To do",
//         tasks: tasks.filter((task) => task.status === "todo"),
//       },
//       {
//         id: "in-progress",
//         title: "In progress",
//         tasks: tasks.filter((task) => task.status === "in-progress"),
//       },
//       {
//         id: "done",
//         title: "Done",
//         tasks: tasks.filter((task) => task.status === "done"),
//       },
//     ],
//     tasksById: Object.fromEntries(tasks.map((task) => [task.id, task])),
//     lastSyncedAt: new Date().toISOString(),
//   };
// }

server.registerTool(
  "pokedex-list",
  {
    title: "Show Pokemon list",
    _meta: {
      // associate this tool with the HTML template
      "openai/outputTemplate": "ui://widget/pokedex.html",
      // labels to display in ChatGPT when the tool is called
      "openai/toolInvocation/invoking": "Displaying the board",
      "openai/toolInvocation/invoked": "Displayed the board",
    },
    inputSchema: { number: z.string().describe("Number of pokemon to list") },
  },
  async () => {
    // let limit = number || 9;
    // try {
    //   const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    //   const data = await res.json() as any;

    //   const detailedPokemons = await Promise.all(
    //     data.results.map(async (p: any) => {
    //       const res = await fetch(p.url);
    //       return res.json();
    //     })
    //   );

    //   if (!data) {
    //     throw new Error("Invalid response format from PokeAPI");
    //   }

    //   return {
    //     structuredContent: {pokemons: detailedPokemons}
    //   }
    // } catch (error) {
    //   console.error("Error fetching pokemons:", error);
    // }

    // const board = await loadKanbanBoard();

    return {
      // structuredContent: {
      //   columns: board.columns.map((column) => ({
      //     id: column.id,
      //     title: column.title,
      //     tasks: column.tasks.slice(0, 5), // keep payload concise for the model
      //   })),
      // },
      content: [
        {
          type: "text",
          text: "Here's your pokemon list.",
        },
      ],
      // _meta: {
      //   tasksById: board.tasksById, // full task map for the component only
      //   lastSyncedAt: board.lastSyncedAt,
      // },
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
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () =>
  console.log(`MCP listening on http://localhost:${PORT}/mcp`)
);
