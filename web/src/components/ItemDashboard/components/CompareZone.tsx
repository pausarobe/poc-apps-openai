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
      className={`flex flex-col h-full min-h-[500px] rounded-[2rem] border-2 transition-all duration-300 p-6 ${
        isDraggingOver 
          ? `border-dashed border-blue-500 bg-blue-500/10 scale-[1.02]` 
          : comparedItems.length === 0 
            ? 'border-dashed border-white/20 bg-white/5' 
            : 'border-solid border-token-border-medium bg-token-main-surface-secondary'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* --- PANTALLA 1: ESTADO VACÍO --- */}
      {comparedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center opacity-60 pointer-events-none text-slate-500">
          <HiOutlineInboxIn className="w-24 h-24 mb-6" />
          <h3 className="text-3xl font-black uppercase tracking-widest mb-2">Tabla de Precios</h3>
          <p className="text-lg">Arrastra las opciones desde el menú para generar la tabla</p>
        </div>
      ) : (
        /* --- PANTALLA 2: VISTA DE TABLA "PRICING" --- */
        <div className="flex flex-col h-full overflow-hidden">
          
          <div className="w-full text-center py-3 mb-6 bg-slate-800 rounded-xl border border-slate-700 text-xs uppercase tracking-widest font-bold text-white/80 shadow-sm">
            Compara tus planes seleccionados
          </div>

          {/* GRID TIPO PRICING TABLES */}
          <div className="flex gap-6 overflow-x-auto pb-6 flex-grow items-stretch px-2">
            {comparedItems.map((item) => (
              <div 
                key={item.sku} 
                className="relative flex flex-col min-w-[260px] max-w-[300px] flex-1 bg-slate-900 rounded-[2rem] border border-slate-700 hover:border-slate-500 transition-all shadow-2xl p-8"
              >
                
                {/* Botón flotante sutil para eliminar */}
                <button 
                  onClick={() => onRemoveItem(item.sku)}
                  className="absolute top-5 right-5 z-10 text-slate-500 hover:text-red-400 hover:bg-white/5 p-2 rounded-full transition-all"
                  title="Quitar de la comparación"
                >
                  <HiX className="w-5 h-5" />
                </button>

                {/* 1. CABECERA: Etiqueta y Título */}
                <div className="mb-6 pr-6">
                  <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2 block">
                    Opción {comparedItems.indexOf(item) + 1}
                  </span>
                  <h4 className="font-bold text-xl leading-tight text-white line-clamp-2">
                    {item.name}
                  </h4>
                </div>

                {/* 2. PRECIO: Formato Gigante tipo SaaS */}
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">{item.price || "0"}</span>
                  <span className="text-xl font-bold text-white/40">€</span>
                </div>

                {/* Línea divisoria elegante */}
                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mb-8"></div>

               {/* 3. CARACTERÍSTICAS: Las Tags del Look */}
                <div className="flex-grow">
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4 block border-b border-white/10 pb-2">
                    Características Destacadas
                  </span>
                  
                  <div className="flex flex-col gap-3 mt-4">
                    {/* Buscamos las tags en diferentes posibles nombres que use tu backend */}
                    {(item.visibleTags || item.tags || item.attributes)?.length > 0 ? (
                      (item.visibleTags || item.tags || item.attributes).map((tag: string) => (
                        <div key={tag} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                          <HiCheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          <span className="text-xs font-bold text-white/90 uppercase tracking-widest">
                            {tag}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-white/30 italic p-2">Sin etiquetas</div>
                    )}
                  </div>
                </div>
                
                {/* 4. BOTÓN DE ACCIÓN (Opcional visualmente para cerrar el diseño de tabla) */}
                <div className="mt-8 pt-6 border-t border-white/5">
                  <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-colors border border-white/10">
                    Seleccionar
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}