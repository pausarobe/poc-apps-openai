import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Badge } from "flowbite-react";
import { HiOutlineViewGrid, HiCurrencyEuro } from "react-icons/hi";
import type { ItemList } from "../lib/types";
import { useOpenAiGlobal } from "../lib/hooks";

async function searchDetail(sku: string) {
  if (!window.openai?.sendFollowUpMessage) return;
  await window.openai.sendFollowUpMessage({
    prompt: `Following previous prompt, I want to see the item with SKU '${sku}'.`,
  });
}

export default function ItemDashboard() { 
  const [items, setItems] = useState<ItemList>();
  const toolOutput = useOpenAiGlobal("toolOutput");

  useEffect(() => {
    try {
      const list = toolOutput?.itemList;
      if (list) setItems(list);
    } catch (error) {
      console.error("Error fetching items data:", error);
    }
  }, [toolOutput]);

  if (!items || items.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
        <p className="text-slate-400 italic">No se han encontrado datos</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 antialiased p-2">
      {/* 1. CABECERA PREMIUM */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border-b-4 border-blue-500 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
            <HiOutlineViewGrid className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight leading-none text-white">Catálogo General</h1>
          </div>
        </div>
        <div className="bg-black/20 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Items:</span>
          <span className="text-2xl font-black text-blue-400">{items.length}</span>
        </div>
      </div>

      {/* 2. GRID DE TARJETAS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {items.map((item) => {
          return (
            <button 
              key={item.sku}
              onClick={() => searchDetail(item.sku)} 
              className="group relative flex flex-col h-full overflow-hidden rounded-[2.5rem] border border-token-border-medium bg-token-main-surface-secondary text-left hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] hover:border-blue-500/50 transition-all duration-500 shadow-sm"
            >
              <div className="relative h-52 overflow-hidden bg-slate-200">
                {item.image ? (
                  <img
                    src={item.image.url}
                    alt={item.image.label}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-400">
                    <HiOutlineViewGrid className="w-12 h-12 opacity-20" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge color="dark" className="bg-black/70 backdrop-blur-md text-white border-0 font-black uppercase tracking-tighter px-3">
                    {item.sku}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col flex-grow p-6">
                <h3 className="line-clamp-2 text-lg font-black text-token-text-primary leading-tight group-hover:text-blue-600 transition-colors mb-2">
                  {item.name}
                </h3>

                {item.description && (
                  <p className="line-clamp-2 text-xs font-medium text-token-text-secondary leading-relaxed opacity-70 mb-4 h-8">
                    {item.description}
                  </p>
                )}

                {/* FOOTER CON PRECIO Y BOTÓN */}
                <div className="mt-auto pt-5 border-t border-token-border-light flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-token-text-tertiary uppercase tracking-widest mb-1">Precio Final</span>
                    <div className="flex items-center gap-1 text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">
                      <HiCurrencyEuro className="w-5 h-5 opacity-40" />
                      {item.price} €
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<ItemDashboard />);
}