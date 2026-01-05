import React from "react";
import { createRoot } from "react-dom/client";
import { useOpenAiGlobal } from "../lib/hooks.js";

function TEST() {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        backgroundColor: "#df2222ff",
        borderRadius: "10px",
        padding: "1rem",
        textAlign: "center",
      }}
    >
      A
    </div>
  );
}

export default function App() {
  const toolOutput = useOpenAiGlobal("toolOutput");

  return (
    <TEST></TEST>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
