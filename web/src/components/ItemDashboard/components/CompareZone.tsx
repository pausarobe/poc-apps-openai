import { useState } from "react";
import { HiOutlineInboxIn, HiX, HiCheckCircle } from "react-icons/hi";

interface CompareZoneProps {
  items: any[]; 
  comparedSkus: string[]; 
  onDropItem: (sku: string) => void; 
  onRemoveItem: (sku: string) => void; 
}

export default function CompareZone({ items, comparedSkus, onDropItem, onRemoveItem }: CompareZoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); 
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const sku = event.dataTransfer.getData("text/plain"); 
    if (sku) {
      onDropItem(sku); 
    }
  };
  
  const comparedItems = comparedSkus
    .map(sku => items.find(i => i.sku === sku))
    .filter(Boolean); 

  return (
    <div 
      className={`flex flex-col h-full rounded-2xl border-2 transition-all duration-300 p-4 ${
        isDraggingOver 
          ? `border-dashed border-blue-500 bg-blue-500/10 scale-[1.01]` 
          : comparedItems.length === 0 
            ? 'border-dashed border-white/20 bg-white/5' 
            : 'border-solid border-token-border-medium bg-token-main-surface-secondary'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* --- PANTALLA VACÍA --- */}
      {comparedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center opacity-60 pointer-events-none text-slate-500 min-h-[300px]">
          <HiOutlineInboxIn className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-bold uppercase tracking-widest mb-2">Tabla Comparativa</h3>
          <p className="text-sm">Arrastra las opciones aquí</p>
        </div>
      ) : (
        /* --- VISTA DE TABLA SEPARADA POR FILAS --- */
        <div className="flex flex-col h-full overflow-hidden">
          
          <div className="w-full text-center py-2 mb-4 bg-slate-800 rounded-lg border border-slate-700 text-[10px] uppercase tracking-widest font-bold text-white/80 shadow-sm">
            Comparativa de Looks
          </div>

          <div className="overflow-x-auto pb-2 flex-grow">
            <div className="flex flex-col gap-4 min-w-max px-1">
              
              {/* FILA 1: CABECERAS */}
              <div className="flex gap-4">
                {comparedItems.map((item) => (
                  <div key={`header-${item.sku}`} className="flex items-start gap-3 w-[200px] shrink-0 bg-slate-900 rounded-xl border border-slate-700 p-3 relative group">
                    <div className="w-10 h-10 rounded-md bg-slate-800 flex-shrink-0 overflow-hidden border border-white/10">
                      {(item.image?.url || item.thumbnail?.url) ? (
                        <img src={item.image?.url || item.thumbnail?.url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-[8px] text-center leading-none">Sin foto</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5 pr-4">
                      <h4 className="font-bold text-[11px] text-white line-clamp-2 leading-tight uppercase" title={item.name}>
                        {item.name}
                      </h4>
                    </div>
                    <button 
                      onClick={() => onRemoveItem(item.sku)}
                      className="absolute top-2 right-2 text-slate-500 hover:text-red-400 bg-white/5 hover:bg-white/10 p-1 rounded-full transition-all"
                      title="Quitar"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* FILA 2: PRECIOS */}
              <div className="flex gap-4">
                {comparedItems.map((item) => (
                  <div key={`price-${item.sku}`} className="w-[200px] shrink-0 bg-slate-800/80 rounded-md p-3 flex justify-between items-center border border-white/5">
                    <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold">Precio</span>
                    <div className="font-black text-white text-sm">
                      {item.price || "0"} <span className="text-[10px] text-white/50 font-normal">€</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* FILA 3: CARACTERÍSTICAS */}
              <div className="flex gap-4 h-full">
                {comparedItems.map((item) => (
                  <div key={`tags-${item.sku}`} className="w-[200px] shrink-0 bg-slate-900/40 rounded-xl border border-white/5 p-3 flex flex-col h-full">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest mb-3 block font-bold text-center">
                      Características
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {(item.visibleTags || item.tags || item.attributes)?.length > 0 ? (
                        (item.visibleTags || item.tags || item.attributes).map((tag: string) => (
                          <div key={tag} className="flex items-center gap-2 bg-white/5 px-2 py-1.5 rounded-md border border-white/5">
                            <HiCheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider truncate">
                              {tag}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-[10px] text-white/30 italic px-2 py-1 text-center">Sin etiquetas</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}