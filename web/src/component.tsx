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

export default function App(results: any) {
  console.error("Datos recibidos en el App", results);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Pokédex React {results.length}</h1>
      {results && <List pokemons={results} />}
      {!results && <div>No hay pokemon</div>}
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
