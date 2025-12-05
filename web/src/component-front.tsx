import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
interface PokemonType {
  type: { name: string };
}

interface Pokemon {
  id: number;
  name: string;
  img: string;
  types: any;
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
  const pokemonsNumber = output?.pokemonNumber || 20;
  const tool = output?.tool || "unknown";
  console.error("pokemonsNumber", pokemonsNumber);

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
