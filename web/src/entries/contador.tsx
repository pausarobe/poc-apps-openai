import { useState } from "react";
import { createRoot } from "react-dom/client";

export default function Contador() {
  //LOGICA
  const [contador, setContador] = useState(0);
  const [reset, setResetear] = useState(false);

  function incrementar() {
    setContador(contador + 1);
  }

  function resetear() {
    setContador(0);
    setResetear(true);
  }

  //RENDER
  return ( 
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", justifyContent: "center"}}>
     <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{contador}</div>
     <button onClick={incrementar} style={{backgroundColor: "blue", padding: "0.5rem 1rem", borderRadius: "0.25rem"}}>+</button>
     <button onClick={resetear} style={{backgroundColor: "blue", padding: "0.5rem 1rem", borderRadius: "0.25rem"}}>Reset</button>
    </div>
  );
}

// RENDERIZADO FINAL
if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<Contador />);
}