import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  return <div>Soy el APP</div>;
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
