import { useState } from "react";
import { HiOutlineInboxIn, HiX, HiCurrencyEuro } from "react-icons/hi";

interface CompareZoneProps {
  items: any[]; 
  comparedSkus: string[]; // Los SKUs que el usuario ha soltado
  onDropItem: (sku: string) => void; // Función para avisar al Cerebro de que algo ha aterrizado
  onRemoveItem: (sku: string) => void; // Función para quitar un item de la comparación
  
}

export default function CompareZone({ items, comparedSkus, onDropItem, onRemoveItem }: CompareZoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necesario para permitir el drop
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
  
  // Buscamos los datos completos de los SKUs que hemos arrastrado
  const comparedItems = comparedSkus
    .map(sku => items.find(i => i.sku === sku))
    .filter(Boolean); // Filtramos por si acaso algún SKU no existiera

  return (
    <div 
      // El diseño cambia dinámicamente si estás arrastrando algo por encima
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
        <div className="flex flex-col items-center justify-center flex-grow text-center opacity-50 pointer-events-none text-white">
          <HiOutlineInboxIn className="w-24 h-24 mb-6" />
          <h3 className="text-3xl font-black uppercase tracking-widest mb-2">Zona de Comparación</h3>
          <p className="text-lg">Arrastra los looks desde la lista izquierda y suéltalos aquí</p>
        </div>
      ) : (
        /* --- PANTALLA 2: VISTA DE COMPARACIÓN --- */
        <div className="flex flex-col h-full overflow-hidden">
         
          <div className="w-full text-center py-3 mb-6 bg-slate-800 rounded-xl border border-slate-700 text-xs uppercase tracking-widest font-bold text-white/60">
            Arrastra más opciones aquí para seguir comparando
          </div>

          {/* GRID DE PRODUCTOS UNO AL LADO DEL OTRO */}
          <div className="flex gap-4 overflow-x-auto pb-4 flex-grow items-stretch">
            {comparedItems.map((item) => (
              <div key={item.sku} className="relative flex flex-col min-w-[250px] flex-1 bg-slate-900 rounded-[1.5rem] border border-white/10 overflow-hidden shadow-xl text-white">
                
                {/* Botón flotante para quitar el producto de la tabla */}
                <button 
                  onClick={() => onRemoveItem(item.sku)}
                  className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                >
                  <HiX className="w-4 h-4" />
                </button>

                {/* Foto */}
                <div className="h-48 bg-slate-800 relative flex-shrink-0">
                  {item.image?.url && (
                    <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Tabla de Atributos */}
                <div className="p-5 flex flex-col flex-grow">
                  <h4 className="font-bold text-lg mb-5 leading-tight text-white">{item.name}</h4>
                  
                  <div className="space-y-4 flex-grow text-sm">
                    
                    {/* PRECIO  */}
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-white/50 uppercase text-[10px] font-black tracking-widest">Precio</span>
                      <span className="font-black flex items-center gap-1 text-lg text-white">
                        <HiCurrencyEuro className="w-5 h-5 text-green-400" /> 
                        {item.price || "N/A"} €
                      </span>
                    </div>

                    {/* ETIQUETAS */}
                    {item.visibleTags?.length > 0 ? (
                      <div className="pt-2">
                        <span className="text-white/50 uppercase text-[10px] font-black tracking-widest block mb-3">Características</span>
                        <div className="flex flex-wrap gap-2">
                          {item.visibleTags.map((tag: string) => (
                            <span key={tag} className="bg-white/10 text-white px-2 py-1 rounded-md text-[10px] uppercase font-bold border border-white/20 shadow-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <span className="text-white/50 uppercase text-[10px] font-black tracking-widest block mb-3">Características</span>
                        <span className="text-white/30 text-xs italic">Sin etiquetas</span>
                      </div>
                    )}
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}