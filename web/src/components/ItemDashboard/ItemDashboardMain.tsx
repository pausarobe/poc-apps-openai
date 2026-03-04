import { useEffect, useState } from "react";
// Ajusta las rutas relativas a tu carpeta 'lib' según sea necesario
import type { ItemList } from "../../lib/types";
import { useOpenAiGlobal } from "../../lib/hooks";

//Importamos las piezas visuales
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import Footer from "./components/Footer";

//Importamos la lógica
import { searchDetail } from "./utils/actions";
import { getModeConfig } from "./utils/themeConfig";

export default function ItemDashboardMain() {
  const [items, setItems] = useState<ItemList>();
  const [category, setCategory] = useState<string>('');
  const [showAll, setShowAll] = useState(false);
  
  // Hook global para leer la respuesta de la IA 
  const toolOutput = useOpenAiGlobal("toolOutput");

  // Efecto para actualizar los datos cuando llegan del servidor
  useEffect(() => {
    try {
      const list = toolOutput?.itemList;
      if (list) setItems(list);
      setCategory(toolOutput?.category || '');
      setShowAll(false); 
    } catch (error) {
      console.error("Error fetching items data:", error);
    }
  }, [toolOutput]);

  // Pantalla de carga mientras no hay datos
  if (!items || items.length === 0) {
    return (
      <div className="p-12 text-center bg-token-main-surface-secondary rounded-[2rem] border border-token-border-medium">
        <p className="text-token-text-tertiary italic">Buscando...</p>
      </div>
    );
  }

  // Obtenemos los colores y textos correspondientes
  const config = getModeConfig(category);
  
  // Lógica de paginación/visualización
  const INITIAL_ITEMS = 4;
  const hasMoreItems = items.length > INITIAL_ITEMS;
  const displayedItems = showAll ? items : items.slice(0, INITIAL_ITEMS);

  return (
    <div className="space-y-8 antialiased p-2">
      {/* 1. CABECERA DINÁMICA */}
      <Header config={config} totalItems={items.length} />

      {/* 2. GRID DE TARJETAS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedItems.map((item) => (
          <ProductCard 
            key={item.sku}
            item={item}
            config={config}
            category={category}
            onItemClick={(sku) => searchDetail(category, sku)}
          />
        ))}
      </div>

      {/* 3. FOOTER - Ver más opciones */}
      {hasMoreItems && !showAll && (
        <Footer 
          config={config}
          hiddenItemsCount={items.length - INITIAL_ITEMS}
          onShowAll={() => setShowAll(true)}
        />
      )}
    </div>
  );
}