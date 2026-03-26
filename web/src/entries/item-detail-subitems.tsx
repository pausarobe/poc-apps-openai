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
    console.log("Rendering ItemDetail component", toolOutput);
    const itemData = toolOutput?.item;
    if (itemData) {
      setItem(itemData);
    }
    const palette = toolOutput?.metaData?.colorPalette;
      console.log(palette);
      if (palette) {
        document.documentElement.setAttribute('data-palette', palette);
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

  {/* HEADER */}
  <div className="pb-4 border-b-2 border-[var(--color-border)]">
    <h1 className="text-2xl sm:text-3xl font-bold text-token-text-primary">
      {item.name}
    </h1>
  </div>

  <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">

    {/* IZQUIERDA */}
    <div className="flex flex-col gap-4">
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

      {/* DESCRIPCIÓN */}
      <div className="rounded-[2.5rem] border border-[var(--color-border)] bg-token-main-surface-secondary p-6 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3 border-b border-[var(--color-border)] pb-2">
          Descripción
        </h3>

        {item.description ? (
          <div
            className="text-sm leading-relaxed text-token-text-secondary prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        ) : (
          <p className="text-xs text-token-text-tertiary italic">
            No hay descripción disponible
          </p>
        )}
      </div>
    </div>

    {/* DERECHA */}
    <div className="flex flex-col gap-4">
      <div className="rounded-[2.5rem] border border-[var(--color-border)] bg-token-main-surface-secondary p-6 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4 border-b border-[var(--color-border)] pb-2">
          Artículos Relacionados {subitems.length > 0 && `(${subitems.length})`}
        </h3>

        {subitems.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {subitems.map((subitem) => (
              <div
                key={subitem.sku}
                className="group flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-token-main-surface-primary transition-all duration-300 hover:shadow-md"
              >
                <div className="relative overflow-hidden rounded-lg w-16 h-16 bg-slate-900">
                  {subitem.image ? (
                    <img
                      src={subitem.image.url}
                      alt={subitem.name}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                      <HiOutlineViewGrid className="w-6 h-6 opacity-20" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-token-text-primary line-clamp-2 mb-1">
                    {subitem.name}
                  </h4>

                  <div className="flex items-center gap-1 text-[var(--color-accent)] font-black">
                    <HiCurrencyEuro className="w-4 h-4 opacity-60" />
                    {Math.round(Number(subitem.price))} €
                  </div>
                </div>

                <button
                  className="
                    px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wide
                    bg-[var(--color-accent)]
                    hover:bg-[var(--color-accent-hover)]
                    text-black
                    transition-all duration-300
                  "
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
