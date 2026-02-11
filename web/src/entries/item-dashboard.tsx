import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Badge } from "flowbite-react";
import { HiOutlineViewGrid, HiCurrencyEuro, HiOfficeBuilding, HiUser, HiInformationCircle } from "react-icons/hi";
import type { ItemList } from "../lib/types";
import { useOpenAiGlobal } from "../lib/hooks";

async function searchDetail(category: string, sku: string) {
  if (!window.openai?.sendFollowUpMessage) return;
  await window.openai.sendFollowUpMessage({
    prompt: `Following the catalog ${category}, I want to see the item with SKU '${sku}'.`,
  });
}

export default function ItemDashboard() {
  const [items, setItems] = useState<ItemList>();
  const [category, setCategory] = useState<string>('');
  const toolOutput = useOpenAiGlobal("toolOutput");

  // Lógica de detección B2B
  const isB2B = category.toLowerCase().includes('b2b');

  useEffect(() => {
    try {
      const list = toolOutput?.itemList;
      if (list) setItems(list);
      setCategory(toolOutput?.category || '');
    } catch (error) {
      console.error("Error fetching items data:", error);
    }
  }, [toolOutput]);

  if (!items || items.length === 0) {
    return (
      <div className="p-12 text-center bg-token-main-surface-secondary rounded-[2rem] border border-token-border-medium">
        <p className="text-token-text-tertiary italic">No se han encontrado datos</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 antialiased p-2">
      {/* 1. CABECERA DINÁMICA */}
      <div className={`bg-gradient-to-r rounded-[2.5rem] p-8 text-white shadow-2xl border-b-4 transition-all duration-500 ${isB2B ? 'from-slate-900 via-indigo-900 to-slate-900 border-indigo-500' : 'from-slate-900 via-blue-900 to-slate-900 border-blue-500'
        }`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
              <HiOutlineViewGrid className={`w-8 h-8 ${isB2B ? 'text-indigo-400' : 'text-blue-400'}`} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight leading-none text-white">
                  {isB2B ? 'Portal Empresas' : 'Catálogo General'}
                </h1>

                {/* Indicador si es B2B o B2C  */}
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border ${isB2B ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}>
                  {isB2B ? 'Para Empresas' : 'Para Particulares'}
                </span>

                {isB2B && (
                  <Badge color="indigo" className="font-black uppercase px-3 py-1">
                    <HiOfficeBuilding className="mr-1 h-3 w-3" /> Business Elite
                  </Badge>
                )}
              </div>
              <p className="text-blue-200 text-sm font-medium italic mt-2 flex items-center gap-2">
                <HiInformationCircle className="w-4 h-4 opacity-70" />
                {isB2B ? 'Gestión de flota y tarifas para cuentas corporativas' : 'Nuestras mejores soluciones para particulares'}
              </p>
            </div>
          </div>
          <div className="bg-black/20 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Resultados:</span>
            <span className={`text-2xl font-black ${isB2B ? 'text-indigo-400' : 'text-blue-400'}`}>{items.length}</span>
          </div>
        </div>
      </div>

      {/* 2. GRID DE TARJETAS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.sku}
            onClick={() => searchDetail(category, item.sku)}
            className={`group relative flex flex-col h-full overflow-hidden rounded-[2.5rem] border bg-token-main-surface-secondary text-left transition-all duration-500 shadow-sm ${isB2B ? 'hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)] border-token-border-medium hover:border-indigo-500/50' : 'hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] border-token-border-medium hover:border-blue-500/50'
              }`}
          >
            <div className="relative h-52 overflow-hidden bg-slate-900">
              {item.image ? (
                <img src={item.image.url} alt={item.image.label} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                  <HiOutlineViewGrid className="w-12 h-12 opacity-20" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <div className={`backdrop-blur-md px-2 py-1 rounded-lg border text-[9px] font-black uppercase flex items-center gap-1 shadow-lg ${isB2B ? 'bg-indigo-600/40 text-indigo-100 border-indigo-400/40' : 'bg-blue-600/40 text-blue-100 border-blue-400/40'
                  }`}>
                  {isB2B ? <HiOfficeBuilding /> : <HiUser />} {isB2B ? 'Empresa' : 'Particular'}
                </div>
              </div>
              <div className="absolute top-4 left-4">
                <Badge color="dark" className="bg-black/70 text-white border-0 font-black uppercase px-3">
                  {item.sku}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col flex-grow p-6">
              <h3 className={`line-clamp-2 text-lg font-black tracking-tight leading-tight transition-colors mb-2 ${isB2B ? 'group-hover:text-indigo-400' : 'group-hover:text-blue-600'
                }`}>
                {item.name}
              </h3>

              <div className="mt-auto pt-5 border-t border-token-border-light flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-token-text-tertiary uppercase tracking-widest mb-1">
                    {isB2B ? 'Cuota Renting' : 'Precio Final'}
                  </span>
                  <div className={`flex items-center gap-1 text-2xl font-black leading-none ${isB2B ? 'text-indigo-400' : 'text-blue-600'}`}>
                    <HiCurrencyEuro className="w-5 h-5 opacity-40" />
                    {item.price} €
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<ItemDashboard />);
}