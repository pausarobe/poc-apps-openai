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
    <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-4">
      {items.map((item) => (
        <div
          key={item.sku}
          // Activamos la capacidad de arrastrar
          draggable={true}
          // Conectamos nuestra función al evento
          onDragStart={(e) => handleDragStart(e, item.sku)}
          
          className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all cursor-grab active:cursor-grabbing group shadow-sm"
        >
          {/* 1. Miniatura del producto */}
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 shadow-inner">
            {item.image?.url ? (
              <img
                src={item.image.url}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <HiOutlineViewGrid className="w-6 h-6 opacity-40" />
              </div>
            )}
          </div>

          {/* 2. Información resumida */}
          <div className="flex flex-col flex-grow min-w-0">
            <h4 className="text-white font-bold text-sm truncate" title={item.name}>
              {item.name}
            </h4>
            
            
          </div>
        </div>
      ))}
    </div>
  );
}