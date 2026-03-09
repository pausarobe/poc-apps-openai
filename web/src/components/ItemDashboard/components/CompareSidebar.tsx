import { HiOutlineViewGrid } from "react-icons/hi";

interface CompareSidebarProps {
  items: any[];
  
}
export default function CompareSidebar({ items }: CompareSidebarProps) {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, sku: string) => {
    //Funcion que se ejecuta al iniciar al arrastrarse
    event.dataTransfer.setData("text/plain", sku);
    event.dataTransfer.effectAllowed = "copy";
  };
  return (
  <div className="flex flex-col gap-2 overflow-y-auto pr-2 pb-4">
    {items.map((item) => (
      <div
        key={item.sku}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, item.sku)}
        // Reducido p-3 -> p-2, Gap-4 -> Gap-2, redondeado 2xl -> xl
        className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all cursor-grab active:cursor-grabbing group shadow-sm"
      >
        {/* 1. Miniatura del producto (Mantenemos w-8 h-8 pero ajustamos iconos internos) */}
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 shadow-inner border border-white/5">
          {item.image?.url ? (
            <img
              src={item.image.url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 grayscale-[0.2] group-hover:grayscale-0"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <HiOutlineViewGrid className="w-4 h-4 opacity-40" />
            </div>
          )}
        </div>

        {/* 2. Información resumida (Letra más pequeña y ajustada) */}
        <div className="flex flex-col flex-grow min-w-0">
          <h4 className="text-white/90 font-bold text-[10px] uppercase tracking-tight truncate leading-tight" title={item.name}>
            {item.name}
          </h4>
          <span className="text-[8px] text-white/30 font-medium truncate">
            {item.sku}
          </span>
        </div>
      </div>
    ))}
  </div>
);
}