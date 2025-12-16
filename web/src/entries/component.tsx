import React from "react";
import { createRoot } from "react-dom/client";
import type { PokemonType, Pokemon } from "../lib/types.js";
import { useOpenAiGlobal } from "../lib/hooks.js";

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
      <img src={pokemon.img} alt={pokemon.name} width={100} height={100} />
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
  if (pokemons.length === 0) {
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
  // const output = (window as any).openai.toolOutput;
  // const p = output?.pokemonList || undefined;

  const toolOutput = useOpenAiGlobal("toolOutput");
  console.error("toolOutput", toolOutput);
  const pokemons = toolOutput?.pokemonList ?? [];
  console.error("pokemons", pokemons);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Pokédex React {pokemons?.length}</h1>
      <List pokemons={pokemons} />
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
