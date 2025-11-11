import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync } from "node:fs";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

// Create an MCP server
const server = new McpServer({ name: "kanban-server", version: "1.0.0" });

// Load locally built assets (produced by your component build)
const JS = readFileSync("../web/dist/component.js", "utf8");

// UI resource (no inline data assignment; host will inject data)
server.registerResource(
  "kanban-widget",
  "ui://widget/kanban-board.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/kanban-board.html",
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
async function loadKanbanBoard() {
  const tasks = [
    {
      id: "task-1",
      title: "Design empty states",
      assignee: "Ada",
      status: "todo",
    },
    {
      id: "task-2",
      title: "Wireframe admin panel",
      assignee: "Grace",
      status: "in-progress",
    },
    {
      id: "task-3",
      title: "QA onboarding flow",
      assignee: "Lin",
      status: "done",
    },
  ];

  return {
    columns: [
      {
        id: "todo",
        title: "To do",
        tasks: tasks.filter((task) => task.status === "todo"),
      },
      {
        id: "in-progress",
        title: "In progress",
        tasks: tasks.filter((task) => task.status === "in-progress"),
      },
      {
        id: "done",
        title: "Done",
        tasks: tasks.filter((task) => task.status === "done"),
      },
    ],
    tasksById: Object.fromEntries(tasks.map((task) => [task.id, task])),
    lastSyncedAt: new Date().toISOString(),
  };
}

server.registerTool(
  "kanban-board",
  {
    title: "Show Kanban Board",
    _meta: {
      // associate this tool with the HTML template
      "openai/outputTemplate": "ui://widget/kanban-board.html",
      // labels to display in ChatGPT when the tool is called
      "openai/toolInvocation/invoking": "Displaying the board",
      "openai/toolInvocation/invoked": "Displayed the board",
    },
    inputSchema: { tasks: z.string() },
  },
  async () => {
    const board = await loadKanbanBoard();

    return {
      structuredContent: {
        columns: board.columns.map((column) => ({
          id: column.id,
          title: column.title,
          tasks: column.tasks.slice(0, 5), // keep payload concise for the model
        })),
      },
      content: [
        {
          type: "text",
          text: "Here's your latest board. Drag cards in the component to update status.",
        },
      ],
      _meta: {
        tasksById: board.tasksById, // full task map for the component only
        lastSyncedAt: board.lastSyncedAt,
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
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () =>
  console.log(`MCP listening on http://localhost:${PORT}/mcp`)
);
