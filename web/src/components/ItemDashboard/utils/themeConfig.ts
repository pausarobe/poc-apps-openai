import { 
  HiOfficeBuilding, 
  HiUser, 
  HiSparkles, 
  HiTag
} from "react-icons/hi";

export function getModeConfig(category: string) {
  const cat = category.toLowerCase();
  
  // CASO 1: Looks de Moda (Retail)
  if (cat.includes('looks')) {
    return {
      gradient: 'from-slate-900 via-emerald-900 to-slate-900 border-emerald-500',
      title: 'Inspiración Looks',
      badge: 'Outfit Completo',
      icon: HiSparkles,
      description: 'Conjuntos seleccionados por nuestros estilistas',
      showPrice: false,
      overlayText: 'Explorar Look',
      accentColor: 'text-emerald-400'
    };
  }
  
  // CASO 2: Prendas Individuales (Retail)
  if (cat.includes('retail_items')) {
    return {
      gradient: 'from-slate-900 via-rose-900 to-slate-900 border-rose-500',
      title: 'Catálogo de Prendas',
      badge: 'Individual',
      icon: HiTag,
      description: 'Nuestras piezas exclusivas de temporada',
      showPrice: true,
      priceLabel: 'Precio Unitario',
      overlayText: 'Ver Prenda',
      accentColor: 'text-rose-400'
    };
  }
  
  // CASO 3: B2B (Empresas - Telco/Coches)
  if (cat.includes('b2b')) {
    return {
      gradient: 'from-slate-900 via-indigo-900 to-slate-900 border-indigo-500',
      title: 'Portal Empresas',
      badge: 'Business Elite',
      icon: HiOfficeBuilding,
      description: 'Gestión de flota y tarifas corporativas',
      showPrice: true,
      priceLabel: 'Cuota Renting',
      overlayText: 'Ver detalle',
      accentColor: 'text-indigo-400'
    };
  }
  
  // CASO POR DEFECTO: B2C (Particulares - Telco/Coches)
  return {
    gradient: 'from-slate-900 via-blue-900 to-slate-900 border-blue-500',
    title: 'Catálogo General',
    badge: 'Particular',
    icon: HiUser,
    description: 'Nuestras mejores soluciones para particulares',
    showPrice: true,
    priceLabel: 'Precio Final',
    overlayText: 'Ver detalle',
    accentColor: 'text-blue-400'
  };
};