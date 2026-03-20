import { createRoot } from "react-dom/client";

import ItemDashboardMain from "../components/ItemDashboard/ItemDashboardMain";
export default ItemDashboardMain;

if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<ItemDashboardMain />);
}