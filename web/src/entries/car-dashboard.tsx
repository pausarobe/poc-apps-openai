import { useEffect, useMemo, useState } from 'react';
import { Badge, Tooltip, Button as FlowbiteButton } from 'flowbite-react'; 
import { 
  HiTruck, HiLightningBolt, HiCurrencyEuro, HiStatusOnline, 
  HiArrowRight, HiLocationMarker, HiArrowsExpand, HiX 
} from 'react-icons/hi';
import { useOpenAiGlobal } from '../lib/hooks.js';
import type { CarData } from '../lib/types.js';
import { createRoot } from 'react-dom/client';

const Button = FlowbiteButton as any;

function CarKPICard({ title, value, subtitle, icon, bgColor, iconColor }: any) {
  return (
    <div className={`${bgColor} rounded-[1.5rem] shadow-xl p-5 flex items-center justify-between text-white border border-token-border-medium`}>
      <div>
        <p className="text-[10px] uppercase font-black tracking-widest opacity-80">{title}</p>
        <p className="text-3xl font-black mt-1">{value}</p>
        <p className="text-xs mt-1 opacity-90 font-medium">{subtitle}</p>
      </div>
      <div className={`${iconColor} bg-white/20 p-3 rounded-2xl backdrop-blur-sm`}>
        {icon}
      </div>
    </div>
  );
}

const getAttrValue = (attributes: any[], code: string) => {
  return attributes?.find(attr => attr.attribute_code === code)?.value;
};

export default function CarAIRentingResults() {
  const [cars, setCars] = useState<CarData[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const toolOutput = useOpenAiGlobal('toolOutput');
  
  // ESTADOS PARA FULLSCREEN
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  
  useEffect(() => {
    // Escuchamos los datos del catálogo
    const carList = toolOutput?.carList || [];
    if (carList.length > 0) {
      setCars(carList);
      
      // AUTO-OPEN: Si llegan datos y no hemos abierto aún, expandimos
      if (!hasAutoOpened) {
        setIsFullscreen(true);
        setHasAutoOpened(true); 
      }
    }
  }, [toolOutput, hasAutoOpened]);

  // Si estamos en fullscreen, mostramos todos; si no, solo 4
  const visibleCars = (isExpanded || isFullscreen) ? cars : cars.slice(0, 4);

  const stats = useMemo(() => {
    const total = cars.length;
    const electricos = cars.filter((c: any) => getAttrValue(c.custom_attributes, 'tipo_motor') === 'ELÉCTRICO').length;
    const cuotas = cars.map((c: any) => Number(getAttrValue(c.custom_attributes, 'cuota_renting') || 0));
    const media = total > 0 ? Math.round(cuotas.reduce((a, b) => a + b, 0) / total) : 0;
    return { total, electricos, media };
  }, [cars]);

  if (cars.length === 0) {
    return (
      <div className="p-12 text-center bg-token-main-surface-primary rounded-[2rem] border-2 border-dashed border-token-border-medium">
        <p className="text-token-text-secondary italic">Cargando flota disponible...</p>
      </div>
    );
  }

  return (
   
    <div className={`
      transition-all duration-500 ease-in-out antialiased
      ${isFullscreen 
        ? "fixed inset-0 z-[9999] w-screen h-screen bg-token-main-surface-primary overflow-y-auto p-4 md:p-12" 
        : "relative w-full h-auto bg-token-main-surface-primary p-2 md:p-6"}
    `}>
      
      <div className={`${isFullscreen ? "max-w-7xl" : "max-w-full"} mx-auto space-y-8 relative`}>
        
        {/* BOTÓN DE TOGGLE: Icono HiX para cerrar pantalla completa */}
        <div className="absolute -top-2 -right-2 z-[10000]">
          <Tooltip content={isFullscreen ? "Minimizar" : "Pantalla Completa"}>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-token-main-surface-tertiary text-token-text-primary p-3 rounded-full shadow-2xl border border-token-border-medium hover:scale-110 transition-transform focus:outline-none"
            >
              {isFullscreen ? <HiX className="w-6 h-6" /> : <HiArrowsExpand className="w-6 h-6" />}
            </button>
          </Tooltip>
        </div>

        {/* Cabecera del Dashboard */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-[2.5rem] p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 border-b-4 border-blue-500">
          <div className="flex items-center gap-5">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl border border-white/20 text-white">
              <HiStatusOnline className="w-8 h-8" />
            </div>
            <div>
              <h1 className={`${isFullscreen ? "text-4xl" : "text-2xl"} font-black text-white tracking-tight`}>Catálogo IA Renting</h1>
              <p className="text-blue-300 font-medium italic">Stock Central de Vehículos</p>
            </div>
          </div>
        </div>

        {/* KPIs: Grid de 3 columnas en pantallas grandes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CarKPICard 
            title="Modelos en Stock" value={stats.total} subtitle="Listos para entrega"
            icon={<HiTruck className="w-6 h-6" />} bgColor="bg-blue-600" iconColor="text-blue-100"
          />
          <CarKPICard 
            title="Cuota Promedio" value={`${stats.media}€`} subtitle="Media mensual"
            icon={<HiCurrencyEuro className="w-6 h-6" />} bgColor="bg-indigo-600" iconColor="text-indigo-100"
          />
          <CarKPICard 
            title="Eco-Friendly" value={stats.electricos} subtitle="Motorización eléctrica"
            icon={<HiLightningBolt className="w-6 h-6" />} bgColor="bg-emerald-600" iconColor="text-emerald-100"
          />
        </div>

        {/* Listado de Coches: Layout adaptativo (4 columnas en Fullscreen) */}
        <div className={`grid gap-4 ${isFullscreen ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"}`}>
          {visibleCars.map((car: any) => {
            const cuota = getAttrValue(car.custom_attributes, 'cuota_renting');
            const motor = getAttrValue(car.custom_attributes, 'tipo_motor');

            return (
              <div key={car.sku} className="bg-token-main-surface-secondary rounded-2xl shadow-lg border border-token-border-medium overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={`https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/media/catalog/product/${car?.media_gallery_entries?.[0]?.file}`} 
                    alt={car.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-3 right-3">
                     <div className="bg-token-main-surface-primary/90 backdrop-blur px-2 py-1 rounded-lg shadow-sm font-black text-blue-700 text-xs">
                      {Math.round(Number(cuota))}€/mes
                     </div>
                  </div>
                </div>
                
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="text-base font-black text-token-text-primary mb-2 group-hover:text-blue-600 transition-colors">{car.name}</h3>
                  <div className="flex flex-col gap-1 mb-3">
                    <Badge color="info" size="xs" className="font-bold uppercase">{car.sku}</Badge>
                    {motor && <Badge color="purple" size="xs" className="font-bold uppercase">{motor}</Badge>}
                  </div>

                  <button className="mt-auto w-full bg-blue-600 text-white font-bold py-2 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 group/btn shadow-inner text-sm">
                    Detalles <HiArrowRight className="w-3 h-3 transform group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botones de Navegación Inferiores */}
        {isFullscreen ? (
          <div className="flex justify-center pt-8">
            <Button color="gray" pill size="xl" onClick={() => setIsFullscreen(false)}>
              Volver al chat
            </Button>
          </div>
        ) : (
          !isExpanded && cars.length > 4 && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="w-full py-6 bg-token-main-surface-secondary border-2 border-dashed border-token-border-medium rounded-[2rem] text-token-text-secondary font-bold hover:bg-token-main-surface-tertiary transition-all flex flex-col items-center gap-2"
            >
              <span className="uppercase tracking-widest text-[10px]">Ver catálogo completo ({cars.length} modelos)</span>
              <HiArrowRight className="rotate-90 w-5 h-5" />
            </button>
          )
        )}
      </div>
    </div>
  );
}

if (typeof window !== 'undefined' && document.getElementById('root')) {
  const root = createRoot(document.getElementById('root')!);
  root.render(<CarAIRentingResults />);
}