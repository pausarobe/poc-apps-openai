import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
interface PokemonType {
  type: { name: string };
}

interface Pokemon {
  id: number;
  name: string;
  sprites: { front_default: string };
  types: PokemonType[];
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
        src={pokemon.sprites?.front_default}
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
  const output = (window as any).openai.toolOutput;
  const pokemons = output?.pokemonList || undefined;
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
