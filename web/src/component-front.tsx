import React, { useEffect, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
interface PokemonType {
  type: { name: string };
}

interface Pokemon {
  id: number;
  name: string;
  sprites: any;
  types: any;
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

function Card({ pokemon }: { pokemon: Pokemon }) {
  console.log("Card", pokemon);
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "1rem",
        textAlign: "center",
      }}
    >
      <img
        src={pokemon.sprites.front_default}
        alt={pokemon.name}
        width={100}
        height={100}
      />
      <h3 style={{ textTransform: "capitalize" }}>{pokemon.name}</h3>
      <p>
        <strong>Tipo:</strong>{" "}
        {pokemon.types.map((t: PokemonType) => t.type.name).join(", ")}
      </p>
    </div>
  );
}

function List({ pokemons }: { pokemons: Pokemon[] }) {
  console.log("List", pokemons);
  if (!pokemons) {
    return <div>No hay pokemons</div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "1rem",
      }}
    >
      {pokemons.map((p: Pokemon) => (
        <Card key={p.id} pokemon={p} />
      ))}
    </div>
  );
}

export default function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);

  const output = (window as any).openai.toolOutput;
  console.error("output", output);
  const toolOutput = useOpenAiGlobal("toolOutput");
  console.error("toolOutput", toolOutput);
  const pokemonsNumber = toolOutput?.number || 20;
  console.error("pokemonsNumber", pokemonsNumber);
  const tool = output?.tool || "unknown";
  console.error("tool", tool);

  useEffect(() => {
    const fetchPokemons = async (limit: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${limit}`
        );
        const data = await res.json();

        const detailedPokemons = await Promise.all(
          data.results.map(async (p: any) => {
            const res = await fetch(p.url);
            return res.json();
          })
        );

        setPokemons(detailedPokemons);
      } catch (error) {
        console.error("Error fetching pokemons:", error);
      }
      setLoading(false);
    };

    fetchPokemons(pokemonsNumber);
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>
        Pokédex Front React {pokemons?.length}
      </h1>
      <p>Tool: {tool}</p>
      {loading && <p style={{ textAlign: "center" }}>Loading pokemons...</p>}
      {!loading && <List pokemons={pokemons} />}
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
