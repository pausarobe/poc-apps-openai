import { useEffect, useState } from "react";
import { Badge } from "flowbite-react";
import { HiCurrencyEuro, HiOutlineViewGrid, HiOfficeBuilding, HiInformationCircle } from "react-icons/hi";
import { useOpenAiGlobal } from "../lib/hooks";
import type { Item } from "../lib/types";
import { createRoot } from "react-dom/client";

export default function ItemDetail() {
  const [item, setItem] = useState<Item>();
  const toolOutput = useOpenAiGlobal("toolOutput");

  // DETECCIÓN DE SEGMENTO: B2B vs B2C
  const isB2B = toolOutput?.category?.toLowerCase().includes('b2b') || item?.sku?.includes('B2B');

  useEffect(() => {
    const itemData = toolOutput?.item;
    if (itemData) {
      setItem(itemData);
    }
    const palette = toolOutput?.metaData?.colorPalette;
      console.log(palette);
      if (palette) {
        document.documentElement.setAttribute('data-palette', palette);
      }
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

  {/* HEADER DINÁMICO CON PALETA */}
  <div className="
    bg-gradient-to-r
    from-slate-900
    via-[var(--color-gradient-mid)]
    to-slate-900
    rounded-[1.25rem] sm:rounded-[2.5rem]
    p-4 sm:p-8
    text-white
    shadow-xl
    border-b-4
    border-[var(--color-border)]
    transition-all duration-500
  ">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">

      <div className="flex items-center gap-4 sm:gap-5">
        <div className="bg-white/10 p-2 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-xl border border-white/20 shrink-0">
          {isB2B
            ? <HiOfficeBuilding className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--color-accent)]" />
            : <HiOutlineViewGrid className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--color-accent)]" />
          }
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-lg sm:text-3xl font-black tracking-tight leading-tight uppercase line-clamp-1">
              {item.name}
            </h1>

            {/* BADGE SEGMENTO */}
            <span className="
              text-[8px] sm:text-[10px]
              font-black uppercase tracking-[0.2em]
              px-2 py-0.5
              rounded
              border
              border-[var(--color-border)]
              bg-[var(--color-accent)]
              text-black
            ">
              {isB2B ? 'Para Empresas' : 'Para Particulares'}
            </span>
          </div>

          <p className="text-[10px] sm:text-xs font-bold opacity-60 uppercase tracking-widest flex items-center gap-1 text-[var(--color-accent)]">
            <HiInformationCircle className="w-3 h-3" />
            {isB2B
              ? 'Tarificación para cuentas corporativas'
              : 'Equipamiento y precio para particular'}
          </p>
        </div>
      </div>

      <div className="self-start sm:self-auto">
        <div className="
          bg-black/30
          text-white
          text-xs sm:text-xl
          font-black
          px-4 py-2 sm:px-6 sm:py-3
          rounded-xl sm:rounded-2xl
          border border-white/10
          uppercase tracking-tighter
        ">
          {item.sku}
        </div>
      </div>

    </div>
  </div>

  {/* CONTENIDO */}
  <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:items-start">

    {/* IMAGEN */}
    <div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--color-border)] bg-slate-900 shadow-lg">
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

    {/* INFO BOX */}
    <div className="
      flex flex-col gap-6
      rounded-[2.5rem]
      border border-[var(--color-border)]
      bg-token-main-surface-secondary
      p-6 sm:p-8
      shadow-sm
      h-full
    ">
      <div>
        <h3 className="
          text-[10px]
          font-black
          uppercase
          tracking-[0.3em]
          text-[var(--color-accent)]
          mb-4
          border-b
          border-[var(--color-border)]
          pb-2
        ">
          Descripción y Detalles
        </h3>

        {item.description && (
          <div
            className="text-sm sm:text-[15px] leading-relaxed text-token-text-secondary prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        )}
      </div>

      {/* FOOTER PRECIO */}
      <div className="
        mt-auto pt-6
        border-t border-[var(--color-border)]
        flex flex-col sm:flex-row sm:items-end
        justify-between gap-4
      ">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-token-text-tertiary mb-1 block">
            {isB2B ? 'Cuota Mensual Neta' : 'Precio Final (IVA Inc.)'}
          </span>

          <div className="flex items-center gap-2 text-3xl sm:text-5xl font-black text-[var(--color-accent)]">
            <HiCurrencyEuro className="w-6 h-6 sm:w-8 sm:h-8 opacity-40" />
            {Math.round(Number(item.price))} €
          </div>
        </div>

        <div className="
          px-4 py-2
          text-xs font-black uppercase
          rounded-lg
          bg-[var(--color-accent)]
          hover:bg-[var(--color-accent-hover)]
          text-black
          transition-all duration-300
        ">
          {isB2B ? "Tarifa Flotas" : "Stock Disponible"}
        </div>
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