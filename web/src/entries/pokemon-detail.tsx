import React from "react";
import { createRoot } from "react-dom/client";
import type { PokemonType } from "../lib/types.js";
import { useOpenAiGlobal } from "../lib/hooks.js";

function Detail({ detail }: { detail: any }) {
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
      {detail && (
        <>
          <h1>{detail.name} detail</h1>
          <Detail detail={detail} />
        </>
      )}
      {!detail && <pre>No detail data</pre>}
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
