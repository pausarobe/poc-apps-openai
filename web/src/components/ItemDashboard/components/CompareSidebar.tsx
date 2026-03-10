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
    /* Usamos un grid de 2 columnas para que queden como "botones" cuadrados, muy compactos */
    <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 pb-4">
      {items.map((item) => (
        <div
          key={item.sku}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, item.sku)}
          // Cambiamos a flex-col, items-center y text-center
          className="flex flex-col items-center text-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all cursor-grab active:cursor-grabbing group shadow-sm"
        >
          {/* 1. Miniatura (Al estar centrada arriba, luce muchísimo más) */}
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 shadow-inner border border-white/5">
            {item.image?.url ? (
              <img
                src={item.image.url}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 grayscale-[0.2] group-hover:grayscale-0"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <HiOutlineViewGrid className="w-5 h-5 opacity-40" />
              </div>
            )}
          </div>

          {/* 2. Información (Centrada debajo) */}
          <div className="flex flex-col w-full px-1">
            {/* Usamos line-clamp-2 para que si el nombre es largo ocupe máximo 2 líneas y no rompa el diseño */}
            <h4 className="text-white/90 font-bold text-[9px] uppercase tracking-tight line-clamp-2 leading-tight" title={item.name}>
              {item.name}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}