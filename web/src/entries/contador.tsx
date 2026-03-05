import { useState } from "react";
import { createRoot } from "react-dom/client";

export default function Contador() {
  //LOGICA

  //RENDER
  return (
    <>aaaa</>
  );
}

// RENDERIZADO FINAL
if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<Contador />);
}