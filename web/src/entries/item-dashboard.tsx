import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Badge } from "flowbite-react";
import { 
  HiArrowRight, HiOutlineViewGrid, HiCurrencyEuro, 
  HiInformationCircle, HiLightningBolt 
} from "react-icons/hi";
import { useOpenAiGlobal } from "../lib/hooks";
import itemsData from "../mock/items.json"; 

const MEDIA_BASE_URL = "https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/media/catalog/product";

const getMockAttr = (attrs: any[], code: string) => 
  attrs?.find(a => a.attribute_code === code)?.value;

async function searchDetail(sku: string) {
  if (!window.openai?.sendFollowUpMessage) return;
  await window.openai.sendFollowUpMessage({
    prompt: `Following previous prompt, I want to see the item with SKU '${sku}'.`,
  });
}

export default function ItemDashboard() {
  const [items] = useState(itemsData.items);

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
            <p className="text-blue-300 text-sm font-medium italic mt-2 flex items-center gap-2">
              <HiInformationCircle className="w-4 h-4" /> Visualización de Inventario PoC
            </p>
          </div>
        </div>
        <div className="bg-black/20 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Items:</span>
          <span className="text-2xl font-black text-blue-400">{items.length}</span>
        </div>
      </div>

      {/* 2. GRID DE TARJETAS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const description = getMockAttr(item.custom_attributes, 'descripcion');
          const cuota = getMockAttr(item.custom_attributes, 'cuota_renting');
          const motor = getMockAttr(item.custom_attributes, 'tipo_motor');
          const imageFile = item.media_gallery_entries?.[0]?.file;

          return (
            <button 
              key={item.sku}
              onClick={() => searchDetail(item.sku)} 
              className="group relative flex flex-col h-full overflow-hidden rounded-[2.5rem] border border-token-border-medium bg-token-main-surface-secondary text-left hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] hover:border-blue-500/50 transition-all duration-500 shadow-sm"
            >
              <div className="relative h-52 overflow-hidden bg-slate-200">
                {imageFile ? (
                  <img
                    src={`${MEDIA_BASE_URL}${imageFile}`}
                    alt={item.name}
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

                {description && (
                  <p className="line-clamp-2 text-xs font-medium text-token-text-secondary leading-relaxed opacity-70 mb-4 h-8">
                    {description}
                  </p>
                )}

                <div className="flex gap-2 mb-4">
                  {motor && (
                    <span className="flex items-center gap-1 text-[9px] font-black bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                      <HiLightningBolt className="w-3 h-3" /> {motor}
                    </span>
                  )}
                </div>

                {/* FOOTER CON PRECIO Y BOTÓN */}
                <div className="mt-auto pt-5 border-t border-token-border-light flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-token-text-tertiary uppercase tracking-widest mb-1">Precio Final</span>
                    <div className="flex items-center gap-1 text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">
                      <HiCurrencyEuro className="w-5 h-5 opacity-40" />
                      {cuota ? Math.round(Number(cuota)) : Math.round(item.price)}€
                    </div>
                  </div>
                  
                  {/* NUEVA IMPLEMENTACIÓN DEL BOTÓN */}
                  <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-2xl group-hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 group-hover:-translate-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Ver detalle</span>
                    <HiArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* FOOTER DE ESTADO */}
      <div className="flex justify-center items-center gap-2 py-6 border-t border-token-border-light">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-black text-token-text-tertiary uppercase tracking-[0.2em] opacity-40">
          NTT DATA POC - Sistema de Gestión Sincronizado
        </span>
      </div>
    </div>
  );
}

if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<ItemDashboard />);
}