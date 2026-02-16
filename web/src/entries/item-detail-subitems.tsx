import { useEffect, useState } from "react";
import { Badge } from "flowbite-react";
import { HiCurrencyEuro, HiOutlineViewGrid, HiOfficeBuilding, HiInformationCircle } from "react-icons/hi";
import { useOpenAiGlobal } from "../lib/hooks";
import type { Item } from "../lib/types";
import { createRoot } from "react-dom/client";

export default function ItemDetail() {
  const [item, setItem] = useState<Item>();
  const [subitems, setSubitems] = useState<Item[]>([]);
  const toolOutput = useOpenAiGlobal("toolOutput");

  // DETECCIÓN DE SEGMENTO: B2B vs B2C
  const isB2B = toolOutput?.category?.toLowerCase().includes('b2b') || item?.sku?.includes('B2B');

  useEffect(() => {
    const itemData = toolOutput?.item;
    if (itemData) {
      setItem(itemData);
    }
    
    const subitemsData = toolOutput?.itemList || [];
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
      
      {/* 1. HEADER DINÁMICO */}
      <div className={`bg-gradient-to-r rounded-[1.25rem] sm:rounded-[2.5rem] p-4 sm:p-8 text-white shadow-xl border-b-2 sm:border-b-4 transition-colors duration-500 ${
        isB2B ? 'from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'from-gray-800 via-gray-700 to-gray-800 border-gray-600'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="bg-white/10 p-2 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-xl border border-white/20 shrink-0">
              {isB2B ? <HiOfficeBuilding className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" /> : <HiOutlineViewGrid className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-lg sm:text-3xl font-black tracking-tight leading-tight uppercase line-clamp-1">
                  {item.name}
                </h1>
                <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border ${
                  isB2B ? 'bg-gray-700/50 text-gray-200 border-gray-600/60' : 'bg-gray-600/50 text-gray-100 border-gray-500/60'
                }`}>
                  {isB2B ? 'Para Empresas' : 'Para Particulares'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-gray-300 opacity-60 uppercase tracking-widest flex items-center gap-1">
                <HiInformationCircle className="w-3 h-3" />
                {isB2B ? 'Tarificación para cuentas corporativas' : 'Equipamiento y precio para particular'}
              </p>
            </div>
          </div>

          <div className="self-start sm:self-auto">
            <div className="bg-black/30 text-white text-xs sm:text-xl font-black px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border border-white/10 uppercase tracking-tighter">
              {item.sku}
            </div>
          </div>
        </div>
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
                    className="group flex gap-3 p-3 rounded-xl border border-token-border-light bg-token-main-surface-primary hover:bg-token-main-surface-tertiary hover:border-token-border-medium transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {/* Imagen pequeña */}
                    <div className="relative overflow-hidden rounded-lg w-20 h-20 flex-shrink-0 bg-slate-900">
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
                      <div className="flex items-center gap-1 mb-2">
                        <HiCurrencyEuro className="w-4 h-4 text-token-text-tertiary opacity-60" />
                        <span className="text-lg font-black text-token-text-primary">
                          {Math.round(Number(subitem.price))} €
                        </span>
                      </div>
                      <button
                        className={`mt-auto px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                          isB2B 
                            ? 'bg-gray-800 hover:bg-gray-900 text-white' 
                            : 'bg-gray-700 hover:bg-gray-800 text-white'
                        }`}
                      >
                        Comprar
                      </button>
                    </div>
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
