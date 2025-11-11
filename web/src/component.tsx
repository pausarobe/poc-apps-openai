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

function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPokemons = async (limit = 20) => {
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

    fetchPokemons();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Pokédex React</h1>
      {loading ? (
        <p style={{ textAlign: "center" }}>Cargando...</p>
      ) : (
        <List pokemons={pokemons} />
      )}
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
