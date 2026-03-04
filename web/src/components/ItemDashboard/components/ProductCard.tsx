import { Badge } from "flowbite-react";
import { HiOutlineViewGrid, HiChevronRight, HiCurrencyEuro } from "react-icons/hi";

interface ProductCardProps {
  item: any;
  config: any;
  category: string;
  onItemClick: (sku: string) => void;
}

export default function ProductCard({ item, config, category, onItemClick }: ProductCardProps) {
  return (
    <button
      onClick={() => onItemClick(item.sku)}
      className="group relative flex flex-col h-full overflow-hidden rounded-[2.5rem] border border-token-border-medium bg-token-main-surface-secondary text-left transition-all duration-500 shadow-sm hover:shadow-xl hover:border-white/50"
    >
      {/* ÁREA DE IMAGEN */}
      <div className="relative h-64 overflow-hidden bg-slate-900 w-full">
        {item.image?.url ? (
          <img 
            src={item.image.url} 
            alt={item.image.label || item.name} 
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
            <HiOutlineViewGrid className="w-12 h-12 opacity-20" />
          </div>
        )}
        
        {/* Overlay interactivo */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white text-black px-4 py-2 rounded-full font-black text-[10px] uppercase flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-2xl">
            {config.overlayText} <HiChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Añadir Etiquetas ocasion, genero, tiempo */}
        {item.visibleTags?.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {item.visibleTags.map((tag: string) => (
              <Badge key={tag} color="dark" className="bg-black/70 text-white border-0 font-black uppercase px-3 backdrop-blur-md">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* ÁREA DE TEXTO */}
      <div className="flex flex-col flex-grow p-6 w-full">
        <h3 className={`line-clamp-2 text-xl font-black tracking-tight leading-tight transition-colors mb-2 ${category.toLowerCase().includes('looks') ? 'text-center' : ''} group-hover:text-blue-500`}>
          {item.name}
        </h3>

        
      </div>
    </button>
  );
}