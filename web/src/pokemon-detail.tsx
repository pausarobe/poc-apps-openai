import React, { useEffect, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { pokemonDetailExample } from "./mock/data.js";

interface PokemonType {
  type: { name: string };
}

declare global {
  interface OpenAIWindowGlobals {
    toolInput?: unknown;
    toolOutput?: any;
    toolResponseMetadata?: unknown;
    widgetState?: unknown;
    theme?: "light" | "dark";
    locale?: string;
  }

  interface OpenAIWindowApi {
    toolInput?: OpenAIWindowGlobals["toolInput"];
    toolOutput?: OpenAIWindowGlobals["toolOutput"];
    toolResponseMetadata?: OpenAIWindowGlobals["toolResponseMetadata"];
    widgetState?: OpenAIWindowGlobals["widgetState"];
    theme?: OpenAIWindowGlobals["theme"];
    locale?: OpenAIWindowGlobals["locale"];

    callTool?: (name: string, args: unknown) => Promise<unknown>;
    setWidgetState?: (state: unknown) => void;
  }
  interface Window {
    openai: OpenAIWindowApi;
  }
}

function useOpenAiGlobal<K extends keyof Window["openai"]>(
  key: K
): Window["openai"][K] {
  return useSyncExternalStore(
    (onChange) => {
      const handler = (event: any) => {
        const value = event.detail.globals[key];
        if (value !== undefined) onChange();
      };
      window.addEventListener("openai:set_globals", handler, { passive: true });
      return () => {
        window.removeEventListener("openai:set_globals", handler);
      };
    },
    () => window.openai[key]
  );
}

function Detail({ detail }: { detail: any }) {
  console.log("Detail", detail);
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "1rem",
        textAlign: "center",
      }}
    >
      <div>
        <img
          src={detail.sprites.front_default}
          alt={detail.name}
          width={100}
          height={100}
        />
        <img
          src={detail.sprites.back_default}
          alt={detail.name}
          width={100}
          height={100}
        />
        <img
          src={detail.sprites.front_shiny}
          alt={detail.name}
          width={100}
          height={100}
        />
        <img
          src={detail.sprites.back_shiny}
          alt={detail.name}
          width={100}
          height={100}
        />
      </div>
      <h3 style={{ textTransform: "capitalize" }}>{detail.name}</h3>
      <p>
        <strong>Tipo:</strong>{" "}
        {detail.types.map((t: PokemonType) => t.type.name).join(", ")}
      </p>
      <p>
        <strong>Peso:</strong> {detail.weight}
      </p>
      <p>
        <strong>Altura:</strong> {detail.height}
      </p>
      <p>
        <strong>Habilidades:</strong>{" "}
        {detail.abilities.map((t: any) => t.ability.name).join(", ")}
      </p>
    </div>
  );
}

export default function App() {
  const toolOutput = useOpenAiGlobal("toolOutput");
  const detail = toolOutput?.pokemonDetail;
  console.error("detail", detail);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{detail.name} detail</h1>
      <Detail detail={detail} />
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
