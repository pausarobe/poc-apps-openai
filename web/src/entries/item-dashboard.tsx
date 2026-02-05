import { useEffect, useMemo, useState } from "react";
import type { ItemList } from "../lib/types";
import { useOpenAiGlobal } from "../lib/hooks";
import { createRoot } from "react-dom/client";
import { Badge } from "flowbite-react";
import {
  HiStatusOnline,
  HiCube,
  HiCurrencyEuro,
  HiOutlineTag,
  HiArrowRight,
  HiPhotograph,
} from "react-icons/hi";

/** Opcional: si en custom_attributes viene {attribute_code, value} estilo Magento */
/*const getAttrValue = (attributes: any[] | undefined, code: string) => {
  const found = attributes?.find((a: any) => a?.attribute_code === code);
  return found?.value;
}; */

function KPICard({
  title,
  value,
  subtitle,
  icon,
  bgColor,
  iconColor,
}: any) {
  return (
    <div className={`${bgColor} rounded-[1.5rem] shadow-xl p-5 flex items-center justify-between text-white`}>
      <div>
        <p className="text-[10px] uppercase font-black tracking-widest opacity-80">
          {title}
        </p>
        <p className="text-3xl font-black mt-1">{value}</p>
        <p className="text-xs mt-1 opacity-90 font-medium">{subtitle}</p>
      </div>
      <div className={`${iconColor} bg-white/20 p-3 rounded-2xl backdrop-blur-sm`}>
        {icon}
      </div>
    </div>
  );
}

const formatEUR = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

export default function ItemDashboard() {
  const [items, setItems] = useState<ItemList>();
  const toolOutput = useOpenAiGlobal("toolOutput");

  useEffect(() => {
    try {
      const list = toolOutput?.itemList;
      console.log("Items Detail:", list);
      console.log("Type:", toolOutput?.type);
      if (list) setItems(list);
    } catch (error) {
      console.error("Error fetching items data:", error);
    }
  }, [toolOutput]);

  const stats = useMemo(() => {
    const list = (items || []) as any[];
    const total = list.length;

    const activos = list.filter((i) => Number(i?.status) === 1).length;

    const prices = list.map((i) => Number(i?.price || 0)).filter((p) => !Number.isNaN(p));
    const avgPrice =
      prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

    // Ejemplo de KPI extra usando custom_attributes si existe:
    // const marcaTop = ... (si tienes atributo tipo "brand" o similar)
    return { total, activos, avgPrice };
  }, [items]);

  // Estado “cargando / sin datos”
  if (!items || items.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
        <p className="text-slate-400 italic">No se han encontrado datos</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8 antialiased">
      {/* TopBar */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-[2.5rem] p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 border-b-4 border-blue-500">
        <div className="flex items-center gap-5">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl border border-white/20 text-white">
            <HiStatusOnline className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Catálogo IA · Items
            </h1>
            <p className="text-blue-300 font-medium italic">
              Resumen ejecutivo de inventario
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-white font-bold border border-white/10">
            <HiOutlineTag className="text-blue-400" />
            ITEM LIST
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Items Totales"
          value={stats.total}
          subtitle="Registros en catálogo"
          icon={<HiCube className="w-6 h-6" />}
          bgColor="bg-blue-600"
          iconColor="text-blue-100"
        />
        <KPICard
          title="Activos"
          value={stats.activos}
          subtitle="Status = 1"
          icon={<HiStatusOnline className="w-6 h-6" />}
          bgColor="bg-emerald-600"
          iconColor="text-emerald-100"
        />
        <KPICard
          title="Precio Medio"
          value={formatEUR(stats.avgPrice)}
          subtitle="Media del PVP"
          icon={<HiCurrencyEuro className="w-6 h-6" />}
          bgColor="bg-indigo-600"
          iconColor="text-indigo-100"
        />
      </div>

      {/* Grid de Items */}
      <div className="max-h-[650px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(items as any[]).map((item) => {
            const imgFile = item?.media_gallery_entries?.[0]?.file;
            const imgUrl = imgFile
              ? `https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/media/catalog/product/${imgFile}`
              : null;

            const status = Number(item?.status);
            const statusLabel = status === 1 ? "ACTIVO" : "INACTIVO";

            // Ejemplos si quieres leer atributos típicos (cambia codes según tu catálogo)
            // const brand = getAttrValue(item.custom_attributes, "brand");
            // const color = getAttrValue(item.custom_attributes, "color");

            return (
              <div
                key={item.id ?? item.sku}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={item?.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <HiPhotograph className="w-5 h-5" />
                        Sin imagen
                      </div>
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg shadow-sm font-black text-blue-700 text-xs">
                      {formatEUR(Number(item?.price || 0))}
                    </div>
                  </div>
                </div>

                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="text-base font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item?.name}
                  </h3>

                  <div className="flex flex-col gap-1 mb-3">
                    {item?.sku && (
                      <Badge color="info" className="font-bold uppercase tracking-tighter text-xs">
                        {item.sku}
                      </Badge>
                    )}

                    <Badge
                      color={status === 1 ? "success" : "gray"}
                      className="font-bold uppercase tracking-tighter text-xs"
                    >
                      {statusLabel}
                    </Badge>

                    {/* Si quieres enseñar algo de custom_attributes (descomenta y ajusta codes)
                    {brand && (
                      <Badge color="purple" className="font-bold uppercase tracking-tighter text-xs">
                        {String(brand)}
                      </Badge>
                    )}
                    */}
                  </div>

                  {item?.description ? (
                    <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                      {item.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic mb-4">
                      Sin descripción disponible
                    </p>
                  )}

                  <button className="mt-auto w-full bg-slate-50 text-slate-600 font-bold py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn shadow-inner text-sm">
                    Ver Detalles
                    <HiArrowRight className="w-3 h-3 transform group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<ItemDashboard />);
}
