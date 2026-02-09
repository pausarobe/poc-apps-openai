import { useEffect, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Badge, Button } from "flowbite-react";
import { HiCurrencyEuro, HiInformationCircle, HiCheckCircle } from "react-icons/hi";
import { useOpenAiGlobal } from "../lib/hooks";
import type { Item } from "../lib/types";

const getAttr = (attrs: any[] | undefined, code: string) => 
  attrs?.find(a => a.attribute_code === code)?.value;

export default function ItemDetail() {
  const [item, setItem] = useState<Item | null>(null);
  const toolOutput = useOpenAiGlobal("toolOutput");

  const MEDIA_BASE_URL = "https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/media/catalog/product";

  useEffect(() => {
    const itemData = toolOutput?.item;
    if (itemData) {
      setItem(itemData);
    }
  }, [toolOutput]);

  const data = useMemo(() => {
    if (!item) return null;
    const desc = item.description || 
                 getAttr(item.custom_attributes, 'description') || 
                 getAttr(item.custom_attributes, 'short_description') || 
                 "No hay descripción detallada disponible.";

    return {
      precio: item.price || getAttr(item.custom_attributes, 'cuota_renting') || 0,
      descripcion: desc
    };
  }, [item]);

  if (!item || !data) return null;

  const imageUrl = item.media_gallery_entries?.find((e) => !e.disabled)?.file;

  return (
    <div className="w-full bg-token-main-surface-primary rounded-[2.5rem] border border-token-border-medium overflow-hidden shadow-sm antialiased">
      
      {/* 1. IMAGEN TIPO BANNER (ALTURA REDUCIDA) */}
      <div className="relative w-full h-64 bg-slate-900 overflow-hidden border-b border-token-border-light">
        {imageUrl ? (
          <img 
            src={imageUrl.startsWith('http') ? imageUrl : `${MEDIA_BASE_URL}${imageUrl}`} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 italic">
            Imagen no disponible
          </div>
        )}
        {/* SKU Badge Flotante */}
        <div className="absolute top-6 left-6">
          <Badge className="bg-black/60 backdrop-blur-xl text-blue-400 border-0 font-black px-4 py-2 uppercase tracking-tighter text-xs">
            {item.sku}
          </Badge>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* 2. NOMBRE Y ESTADO */}
        <div>
          <h1 className="text-4xl font-black text-token-text-primary tracking-tight leading-tight mb-2">
            {item.name}
          </h1>
          <div className="flex items-center gap-2 text-[10px] text-blue-500 font-black uppercase tracking-[0.2em]">
            <HiInformationCircle className="w-4 h-4" />
            Stock Central • Disponibilidad Inmediata
          </div>
        </div>

        {/* 3. CAJA DE PRECIO PREMIUM */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 rounded-[2rem] text-white shadow-2xl flex justify-between items-center border-b-4 border-blue-600 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] uppercase font-black opacity-50 tracking-[0.2em] mb-2 text-white">Cuota Mensual</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black">{Math.round(Number(data.precio))}€</span>
              <span className="text-lg opacity-40 font-bold uppercase">/ mes</span>
            </div>
          </div>
          <HiCurrencyEuro className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 text-blue-400" />
        </div>

        {/* 4. DESCRIPCIÓN */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-token-text-tertiary uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-8 h-[1px] bg-token-border-medium"></span>
            Descripción y Detalles
          </h3>
          <div 
            className="prose prose-sm dark:prose-invert max-w-none text-token-text-secondary leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: data.descripcion }} 
          />
        </div>

        {/* 5. BOTÓN DE ACCIÓN GIGANTE */}
        <Button 
          size="xl" 
          className="w-full rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white border-0 py-6 transition-all hover:scale-[1.01]"
        >
          <HiCheckCircle className="mr-3 h-7 w-7" /> Reservar Ahora
        </Button>
      </div>
    </div>
  );
}