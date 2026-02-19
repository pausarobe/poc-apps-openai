import { useEffect, useState } from "react";
import { HiCurrencyEuro, HiOutlineViewGrid } from "react-icons/hi";
import { useOpenAiGlobal } from "../lib/hooks";
import type { Item } from "../lib/types";
import { createRoot } from "react-dom/client";

export default function ItemDetail() {
  const [item, setItem] = useState<Item>();
  const [subitems, setSubitems] = useState<Item[]>([]);
  const toolOutput = useOpenAiGlobal("toolOutput");

  useEffect(() => {
    const itemData = toolOutput?.item;
    if (itemData) {
      setItem(itemData);
    }
    
    const subitemsData = itemData?.related_products || [];
    setSubitems(subitemsData);
  }, [toolOutput]);

  if (!item) {
    return (
      <div className="p-12 text-center bg-token-main-surface-secondary rounded-[2rem] border border-token-border-medium animate-pulse">
        <p className="text-token-text-tertiary italic text-sm">Consultando especificaciones del activo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 antialiased p-2 sm:p-4 lg:p-6">
      
      {/* 1. HEADER SIMPLE */}
      <div className="pb-4 border-b border-token-border-medium">
        <h1 className="text-2xl sm:text-3xl font-bold text-token-text-primary">
          {item.name}
        </h1>
      </div>

      {/* 2. CONTENIDO PRINCIPAL: Imagen + Descripción + Subitems */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        
        {/* COLUMNA IZQUIERDA: Imagen principal + Pie de foto */}
        <div className="flex flex-col gap-4">
          {/* IMAGEN PRINCIPAL */}
          <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-token-border-medium bg-slate-900 shadow-lg">
            <div className="relative w-full h-64 sm:h-80 lg:h-96">
              {item.image ? (
                <img
                  src={item.image.url}
                  alt={item.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-500">
                  <HiOutlineViewGrid className="w-16 h-16 opacity-20" />
                </div>
              )}
            </div>
          </div>

          {/* PIE DE FOTO CON DESCRIPCIÓN */}
          <div className="rounded-[2rem] sm:rounded-[2.5rem] border border-token-border-medium bg-token-main-surface-secondary p-4 sm:p-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-token-text-tertiary mb-3 border-b border-token-border-light pb-2">
              Descripción
            </h3>
            {item.description ? (
              <div 
                className="text-xs sm:text-sm leading-relaxed text-token-text-secondary prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            ) : (
              <p className="text-xs text-token-text-tertiary italic">No hay descripción disponible</p>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Listado de Subitems */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[2rem] sm:rounded-[2.5rem] border border-token-border-medium bg-token-main-surface-secondary p-4 sm:p-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-token-text-tertiary mb-4 border-b border-token-border-light pb-2">
              Artículos Relacionados {subitems.length > 0 && `(${subitems.length})`}
            </h3>
            
            {subitems.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {subitems.map((subitem) => (
                  <div 
                    key={subitem.sku}
                    className="group flex items-center gap-3 p-3 rounded-xl border border-token-border-light bg-token-main-surface-primary hover:bg-token-main-surface-tertiary hover:border-token-border-medium transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {/* Imagen pequeña */}
                    <div className="relative overflow-hidden rounded-lg w-16 h-16 flex-shrink-0 bg-slate-900">
                      {subitem.image ? (
                        <img
                          src={subitem.image.url}
                          alt={subitem.name}
                          className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                          <HiOutlineViewGrid className="w-6 h-6 opacity-20" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-token-text-primary line-clamp-2 mb-1">
                        {subitem.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        <HiCurrencyEuro className="w-4 h-4 text-token-text-tertiary opacity-60" />
                        <span className="text-base font-bold text-token-text-primary">
                          {Math.round(Number(subitem.price))} €
                        </span>
                      </div>
                    </div>

                    {/* Botón a la derecha */}
                    <button
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                        'bg-gray-700 hover:bg-gray-800 text-white'
                      }`}
                    >
                      Comprar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-token-text-tertiary italic text-center py-8">
                No hay artículos relacionados disponibles
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// RENDERIZADO FINAL
if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<ItemDetail />);
}
