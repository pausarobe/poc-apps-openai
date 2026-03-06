import { useEffect, useState } from "react";

import type { ItemList } from "../../lib/types";
import { useOpenAiGlobal } from "../../lib/hooks";
import { HiSwitchHorizontal, HiOutlineViewGrid } from "react-icons/hi";


import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import Footer from "./components/Footer";


import CompareSidebar from "./components/CompareSidebar";
import CompareZone from "./components/CompareZone";


import { searchDetail } from "./utils/actions";
import { getModeConfig } from "./utils/themeConfig";

export default function ItemDashboardMain() {
  // Estados originales
  const [items, setItems] = useState<ItemList>();
  const [category, setCategory] = useState<string>('');
  const [showAll, setShowAll] = useState(false);
  
  // Estados del Comparador
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [comparedSkus, setComparedSkus] = useState<string[]>([]);

  const toolOutput = useOpenAiGlobal("toolOutput");

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

  if (!items || items.length === 0) {
    return (
      <div className="p-12 text-center bg-token-main-surface-secondary rounded-[2rem] border border-token-border-medium">
        <p className="text-token-text-tertiary italic">Buscando...</p>
      </div>
    );
  }

  const config = getModeConfig(category);
  const INITIAL_ITEMS = 4;
  const hasMoreItems = items.length > INITIAL_ITEMS;
  const displayedItems = showAll ? items : items.slice(0, INITIAL_ITEMS);

  // FUNCIÓN 1: Añadir al comparador
  const handleDropItem = (sku: string) => {
    setComparedSkus((prev) => {
      // Evitamos que el usuario añada el mismo producto dos veces
      if (prev.includes(sku)) return prev;
      return [...prev, sku];
    });
  };

  // FUNCIÓN 2: Quitar del comparador
  const handleRemoveItem = (sku: string) => {
    setComparedSkus((prev) => prev.filter((itemSku) => itemSku !== sku));
  };

  return (
    <div className="space-y-6 antialiased p-2">
      
     
      <Header config={config} totalItems={items.length} />

      
      <div className="flex justify-end px-4">
        <button 
          onClick={() => setIsCompareMode(!isCompareMode)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest transition-all shadow-lg border ${
            isCompareMode 
              ? 'bg-slate-800 text-white hover:bg-slate-700 border-white/20' 
              : `bg-slate-900 text-white hover:bg-white/20 border-white/10 hover:border-white/30`
          }`}
        >
          {isCompareMode ? (
            <><HiOutlineViewGrid className="w-5 h-5" /> Volver al Catálogo</>
          ) : (
            <><HiSwitchHorizontal className="w-5 h-5" /> Activar Comparador</>
          )}
        </button>
      </div>

      {/*INTERRUPTOR VISUAL */}
      {!isCompareMode ? (
        
        /* --- MODO 1: CATÁLOGO NORMAL --- */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          {hasMoreItems && !showAll && (
            <Footer 
              config={config}
              hiddenItemsCount={items.length - INITIAL_ITEMS}
              onShowAll={() => setShowAll(true)}
            />
          )}
        </div>

      ) : (
        
        /* --- MODO 2: PANTALLA DIVIDIDA DEL COMPARADOR --- */
        
        <div className="flex flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[600px] w-full">
          
          {/* Columna Izquierda  */}
          <div className="w-[35%] min-w-[200px] bg-slate-900 rounded-[2rem] p-4 flex flex-col border border-token-border-medium shadow-inner h-full">
            <h3 className="text-white/50 uppercase tracking-widest text-[10px] font-black mb-4 px-2 text-center">
              Tus Opciones ({items.length})
            </h3>
            <CompareSidebar items={items}  />
          </div>

          {/* Columna Derecha  */}
          <div className="w-[65%] h-full">
            <CompareZone 
              items={items}
              comparedSkus={comparedSkus}
              onDropItem={handleDropItem}
              onRemoveItem={handleRemoveItem}
              
            />
          </div>

        </div>
      )}
    </div>
  );
}