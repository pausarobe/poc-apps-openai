import { useState } from "react";
import { createRoot } from "react-dom/client";

export default function Input() {
  //LOGICA
  const [inputValue, setInputValue] = useState("");
  const [displayValue, setDisplayValue] = useState("Hola");

  function InputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
  }

  function updateText() {
    setDisplayValue(inputValue);
    setInputValue("");
  }
  //RENDER
  return ( 
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", justifyContent: "center"}}>
     <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{displayValue}</div>
     <input type="text" value={inputValue} onChange={InputChange} style={{padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #ccc"}} />
     <button onClick={updateText} style={{backgroundColor: "blue", padding: "0.5rem 1rem", borderRadius: "0.25rem"}}>Actualizar</button>
    </div>
  );
}

// RENDERIZADO FINAL
if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<Input />);
}