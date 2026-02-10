import { useEffect, useState } from "react";
import { Badge } from "flowbite-react";
import { HiCurrencyEuro, HiOutlineViewGrid } from "react-icons/hi";
import { useOpenAiGlobal } from "../lib/hooks";
import type { Item } from "../lib/types";

/* const getAttr = (attrs: any[] | undefined, code: string) => {
  return attrs?.find(a => a.attribute_code === code)?.value;
} */

export default function ItemDetail() {
  console.log('loading detail');
  const [item, setItem] = useState<Item>();
  const toolOutput = useOpenAiGlobal("toolOutput");

  useEffect(() => {
    const itemData = toolOutput?.item;
    if (itemData) {
      setItem(itemData);
    }
  }, [toolOutput]);

  if (!item) {
    return (
      <div className="p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
        <p className="text-slate-400 italic">No se han encontrado datos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 antialiased p-2 sm:p-4 lg:p-6">
      {/* HEADER – mobile compacto / desktop premium */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 
                rounded-[1.25rem] sm:rounded-[2.5rem]
                p-3 sm:p-8
                text-white shadow-xl sm:shadow-2xl
                border-b-2 sm:border-b-4 border-blue-500">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">

          {/* IZQUIERDA */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="bg-white/10 p-2 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner shrink-0">
              <HiOutlineViewGrid className="w-5 h-5 sm:w-8 sm:h-8 text-blue-400" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg sm:text-3xl font-black tracking-tight leading-tight line-clamp-2">
                {item.name}
              </h1>
            </div>
          </div>

          {/* SKU – debajo en mobile, badge simple */}
          <div className="self-start sm:self-auto">
            <span className="inline-block
                       bg-black/30 sm:bg-black/20
                       text-blue-300 sm:text-blue-400
                       text-xs sm:text-2xl
                       font-black tracking-tight
                       px-3 py-1.5 sm:px-6 sm:py-3
                       rounded-xl sm:rounded-2xl
                       border border-white/10">
              {item.sku}
            </span>
          </div>
        </div>
      </div>

      {/* 2. DETALLE DEL ITEM (mobile 1 col / desktop 2 cols) */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:items-start">
        {/* IMAGEN (siempre llena + responsive) */}
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-token-border-medium bg-slate-200 shadow-lg">
          {/* Altura estable en mobile/tablet, y en desktop altura “hero” */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[520px]">
            {item.image ? (
              <img
                src={item.image.url}
                alt={item.image.label ?? item.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-300 text-slate-400">
                <HiOutlineViewGrid className="w-16 h-16 sm:w-20 sm:h-20 opacity-20" />
              </div>
            )}
          </div>

          <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
            <Badge className="bg-black/70 backdrop-blur-md text-white border-0 font-black uppercase tracking-tighter px-3 sm:px-4 py-1">
              {item.sku}
            </Badge>
          </div>
        </div>

        {/* INFO */}
        <div className="flex flex-col gap-5 sm:gap-6 rounded-[2rem] sm:rounded-[2.5rem] border border-token-border-medium bg-token-main-surface-secondary p-5 sm:p-8 shadow-sm">
          {/* DESCRIPCIÓN */}
          {item.description && (
            <p className="text-sm sm:text-[15px] leading-relaxed text-token-text-secondary opacity-80">
              {item.description}
            </p>
          )}

          {/* FOOTER PRECIO */}
          <div className="mt-2 sm:mt-auto pt-6 border-t border-token-border-light">
            <span className="text-[10px] font-black uppercase tracking-widest text-token-text-tertiary mb-2 block">
              Precio final
            </span>
            <div className="flex items-center gap-2 text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
              <HiCurrencyEuro className="w-6 h-6 sm:w-7 sm:h-7 opacity-40" />
              {item.price} €
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}