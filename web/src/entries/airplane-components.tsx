import React from "react";
import { createRoot } from "react-dom/client";
import type { PokemonType, Pokemon, Airplane } from "../lib/types.js";
import { useOpenAiGlobal } from "../lib/hooks.js";

function Card({ airplane }: { airplane: Airplane }) {
  console.log("Card", airplane);
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "1rem",
        textAlign: "center",
      }}
    >
      {/* <img src={pokemon.img} alt={pokemon.name} width={100} height={100} /> */}
      <h3 style={{ textTransform: "capitalize" }}>{airplane.production_line}</h3>
      {/* <p>
        <strong>Tipo:</strong>{" "}
        {pokemon.types.map((t: PokemonType) => t.type.name).join(", ")}
      </p> */}
    </div>
  );
}

function List({ airplanes }: { airplanes: Airplane[] }) {
  console.log("List", airplanes);
  if (airplanes.length === 0) {
    return <div>No hay airplanes</div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "1rem",
      }}
    >
      {airplanes.map((p: Airplane) => (
        <Card key={p.iata_code_long} airplane={p} />
      ))}
    </div>
  );
}

export default function App() {
  // const output = (window as any).openai.toolOutput;
  // const p = output?.pokemonList || undefined;

  const toolOutput = useOpenAiGlobal("toolOutput");
  console.error("toolOutput", toolOutput);
  const airplanes = toolOutput?.airplaneList ?? [];
  console.error("airplanes", airplanes);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Airplanes React {airplanes?.length}</h1>
      <List airplanes={airplanes} />
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
