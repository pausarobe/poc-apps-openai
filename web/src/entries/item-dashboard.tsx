import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Badge } from "flowbite-react";
import { 
  HiOutlineViewGrid, 
  HiCurrencyEuro, 
  HiOfficeBuilding, 
  HiUser, 
  HiInformationCircle, 
  HiSparkles, 
  HiTag, 
  HiChevronRight 
} from "react-icons/hi";
import type { ItemList } from "../lib/types";
import { useOpenAiGlobal } from "../lib/hooks";


async function searchDetail(category: string, sku: string) {
  if (!window.openai?.sendFollowUpMessage) return;
  // await window.openai.sendFollowUpMessage({
  //   prompt: `Following the catalog ${category}, I want to see the item with SKU '${sku}'.`,
  // });  

  window.openai?.sendFollowUpMessage?.({
    prompt: `Responde con: "✅ Ok, estoy ejecutando la operación..."`,
  });
  window.openai?.callTool?.("retail-dashboard", { inputParameters: { sku, category }, sku: sku, catalog: category });
}

export default function ItemDashboard() {
  const [items, setItems] = useState<ItemList>();
  const [category, setCategory] = useState<string>('');
  const toolOutput = useOpenAiGlobal("toolOutput");

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
        <p className="text-token-text-tertiary italic">Buscando...</p>
      </div>
    );
  }

 
  const getModeConfig = () => {
    const cat = category.toLowerCase();
    
    // CASO 1: Looks de Moda (Retail)
    if (cat.includes('looks')) {
      return {
        gradient: 'from-slate-900 via-emerald-900 to-slate-900 border-emerald-500',
        title: 'Inspiración Looks',
        badge: 'Outfit Completo',
        icon: HiSparkles,
        description: 'Conjuntos seleccionados por nuestros estilistas',
        showPrice: false,
        overlayText: 'Explorar Look',
        accentColor: 'text-emerald-400'
      };
    }
    // CASO 2: Prendas Individuales (Retail)
    if (cat.includes('retail_items')) {
      return {
        gradient: 'from-slate-900 via-rose-900 to-slate-900 border-rose-500',
        title: 'Catálogo de Prendas',
        badge: 'Individual',
        icon: HiTag,
        description: 'Nuestras piezas exclusivas de temporada',
        showPrice: true,
        priceLabel: 'Precio Unitario',
        overlayText: 'Ver Prenda',
        accentColor: 'text-rose-400'
      };
    }
    // CASO 3: B2B (Empresas - Telco/Coches)
    if (cat.includes('b2b')) {
      return {
        gradient: 'from-slate-900 via-indigo-900 to-slate-900 border-indigo-500',
        title: 'Portal Empresas',
        badge: 'Business Elite',
        icon: HiOfficeBuilding,
        description: 'Gestión de flota y tarifas corporativas',
        showPrice: true,
        priceLabel: 'Cuota Renting',
        overlayText: 'Ver detalle',
        accentColor: 'text-indigo-400'
      };
    }
    // CASO POR DEFECTO: B2C (Particulares - Telco/Coches)
    return {
      gradient: 'from-slate-900 via-blue-900 to-slate-900 border-blue-500',
      title: 'Catálogo General',
      badge: 'Particular',
      icon: HiUser,
      description: 'Nuestras mejores soluciones para particulares',
      showPrice: true,
      priceLabel: 'Precio Final',
      overlayText: 'Ver detalle',
      accentColor: 'text-blue-400'
    };
  };

  const config = getModeConfig();
  const IconHeader = config.icon;

  return (
    <div className="space-y-8 antialiased p-2">
      {/* 1. CABECERA DINÁMICA */}
      <div className={`bg-gradient-to-r rounded-[2.5rem] p-8 text-white shadow-2xl border-b-4 transition-all duration-500 ${config.gradient}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
              <IconHeader className={`w-8 h-8 ${config.accentColor}`} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight leading-none text-white uppercase italic">
                  {config.title}
                </h1>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border bg-white/10 border-white/20">
                  {config.badge}
                </span>
              </div>
              <p className="text-white/60 text-sm font-medium italic mt-2 flex items-center gap-2">
                <HiInformationCircle className="w-4 h-4 opacity-70" />
                {config.description}
              </p>
            </div>
          </div>
          <div className="bg-black/20 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3 font-mono">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Resultados:</span>
            <span className={`text-2xl font-black ${config.accentColor}`}>{items.length}</span>
          </div>
        </div>
      </div>

      {/* 2. GRID DE TARJETAS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.sku}
            onClick={() => 
              
              
              
              searchDetail(category, item.sku)
              
            }
            className="group relative flex flex-col h-full overflow-hidden rounded-[2.5rem] border border-token-border-medium bg-token-main-surface-secondary text-left transition-all duration-500 shadow-sm hover:shadow-xl hover:border-white/50"
          >
            {/* ÁREA DE IMAGEN */}
            <div className="relative h-64 overflow-hidden bg-slate-900">
              {item.image?.url ? (
                <img 
                  src={item.image.url} 
                  alt={item.image.label || item.name} 
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                  <HiOutlineViewGrid className="w-12 h-12 opacity-20" />
                </div>
              )}
              
              {/* Overlay interactivo */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white text-black px-4 py-2 rounded-full font-black text-[10px] uppercase flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-2xl">
                  {config.overlayText} <HiChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Añadir Etiquetas ocasion, genero, tiempo */}
              {item.visibleTags?.length && (
                <div className="absolute top-4 left-4">
                  {item.visibleTags.map(tag => (
                    <Badge key={tag} color="dark" className="bg-black/70 text-white border-0 font-black uppercase px-3 backdrop-blur-md mr-2">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* ÁREA DE TEXTO */}
            <div className="flex flex-col flex-grow p-6">
              <h3 className={`line-clamp-2 text-xl font-black tracking-tight leading-tight transition-colors mb-2 ${category.toLowerCase().includes('looks') ? 'text-center' : ''} group-hover:text-blue-500`}>
                {item.name}
              </h3>

              {/* Sección de Precio Condicional */}
              {config.showPrice && (
                <div className="mt-auto pt-5 border-t border-token-border-light flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-token-text-tertiary uppercase tracking-widest mb-1">
                      {config.priceLabel}
                    </span>
                    <div className={`flex items-center gap-1 text-2xl font-black leading-none ${config.accentColor}`}>
                      <HiCurrencyEuro className="w-5 h-5 opacity-40" />
                      {item.price} €
                    </div>
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Renderizado final
if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<ItemDashboard />);
}