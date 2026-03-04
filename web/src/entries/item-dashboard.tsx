import { createRoot } from "react-dom/client";
// Importamos el componente principal 
import ItemDashboardMain from "../components/ItemDashboard/ItemDashboardMain";

// Renderizado final
if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<ItemDashboardMain />);
}