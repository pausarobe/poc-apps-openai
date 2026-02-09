import { useEffect, useState } from "react";
import type { ItemList } from "../lib/types";
import { useOpenAiGlobal } from "../lib/hooks";
import { createRoot } from "react-dom/client";

async function searchDetail(sku: string) {
  if (!window.openai?.sendFollowUpMessage) {
    console.error('window.openai.sendFollowUpMessage is not available');
    return;
  }
  await window.openai.sendFollowUpMessage({
    prompt: `Following previous prompt, I want to see the item with SKU '${sku}'.`,
  });
}


/** Opcional: si en custom_attributes viene {attribute_code, value} estilo Magento */
/*const getAttrValue = (attributes: any[] | undefined, code: string) => {
  const found = attributes?.find((a: any) => a?.attribute_code === code);
  return found?.value;
}; */

const formatEUR = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

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
    <div className="space-y-6">
      <div />

      {/* Items Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <button onClick={() => searchDetail(item.sku)} className="relative h-full overflow-hidden rounded-lg border border-border bg-card block">
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden bg-secondary/30">
              {item.media_gallery_entries ? (
                <img
                  src={item.media_gallery_entries[0]?.file}
                  alt={item.media_gallery_entries[0]?.label || item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary/30">
                  <svg
                    className="h-12 w-12 text-muted-foreground/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {/* Content Container */}
              <div className="flex flex-col gap-3 p-4">
                {/* SKU */}
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {item.sku}
                </p>

                {/* Item Name */}
                {item.name && <h3 className="line-clamp-2 text-base font-semibold text-foreground">
                  {item.name}
                </h3>}

                {/* Description */}
                {item.description && <p className="line-clamp-2 text-sm text-muted-foreground">
                  {item.description}
                </p>}

                {/* Footer with Price */}
                <div className="mt-auto flex items-baseline justify-between border-t border-border pt-3">
                  {item.price && <span className="text-2xl font-bold text-primary">
                    {formatEUR(item.price)} €
                  </span>}
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
