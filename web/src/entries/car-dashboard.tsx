import  { useEffect, useMemo, useState } from 'react';
import {  Badge } from 'flowbite-react';
import { HiTruck, HiLightningBolt, HiCurrencyEuro, HiStatusOnline, HiArrowRight, HiLocationMarker } from 'react-icons/hi';
import { useOpenAiGlobal } from '../lib/hooks.js';
import type { CarData } from '../lib/types.js';
import { createRoot } from 'react-dom/client';

export const a = 5;

function CarKPICard({ title, value, subtitle, icon, bgColor, iconColor }: any) {
  return (
    <div className={`${bgColor} rounded-[1.5rem] shadow-xl p-5 flex items-center justify-between text-white`}>
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
  const toolOutput = useOpenAiGlobal('toolOutput');
  
  

  useEffect(() => {
    async function getCarData() {
      try {
        const carList = toolOutput?.carList || [] ;
        console.log('Car List:', carList);
        console.log('Type:', toolOutput?.type);

        if (carList) {
          setCars(carList);
        }
      } catch (error) {
        console.error('Error fetching carList data:', error);
      }
    }

    getCarData();
  }, [toolOutput]);


  // Cálculos de indicadores basados en los vuelos
  const stats = useMemo(() => {
    console.log('Calculando estadísticas para coches, total coches:', cars.length);
    const total = cars.length;
    const electricos = cars.filter((c: any) => getAttrValue(c.custom_attributes, 'tipo_motor') === 'ELÉCTRICO').length;
    const cuotas = cars.map((c: any) => Number(getAttrValue(c.custom_attributes, 'cuota_renting') || 0));
    const media = total > 0 ? Math.round(cuotas.reduce((a, b) => a + b, 0) / total) : 0;
    return { total, electricos, media };
  }, [cars]);

  if (cars.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
        <p className="text-slate-400 italic">Esperando datos del catálogo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8 antialiased">
      {/* TopBar Estilo Profesional */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-[2.5rem] p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 border-b-4 border-blue-500">
        <div className="flex items-center gap-5">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl border border-white/20 text-white">
            <HiStatusOnline className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Catálogo IA Renting</h1>
            <p className="text-blue-300 font-medium italic">Resumen operativo de flota</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-white font-bold border border-white/10">
            <HiLocationMarker className="text-blue-400" /> STOCK CENTRAL
          </div>
        </div>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CarKPICard 
          title="Modelos en Stock" value={stats.total} subtitle="Vehículos listos"
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

      {/* Grid de Coches */}
      <div className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cars.map((car: any) => {
            const cuota = getAttrValue(car.custom_attributes, 'cuota_renting');
            const motor = getAttrValue(car.custom_attributes, 'tipo_motor');
            // const img = new URL('../mock/Modelo_electrico.jpg', import.meta.url).href;

            return (
              <div key={car.sku} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col">
                <div className="relative h-40 overflow-hidden">
                  <img src={`https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/media/catalog/product/${car?.media_gallery_entries?.[0]?.file}`} alt={car.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 right-3">
                     <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg shadow-sm font-black text-blue-700 text-xs">
                      {Math.round(Number(cuota))}€/mes
                     </div>
                  </div>
                </div>
                
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="text-base font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{car.name}</h3>
                  <div className="flex flex-col gap-1 mb-3">
                    <Badge color="info" className="font-bold uppercase tracking-tighter text-xs">{car.sku}</Badge>
                    {motor && <Badge color="purple" className="font-bold uppercase tracking-tighter text-xs">{motor}</Badge>}
                  </div>

                  <button className="mt-auto w-full bg-slate-50 text-slate-600 font-bold py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn shadow-inner text-sm">
                    Ver Detalles <HiArrowRight className="w-3 h-3 transform group-hover/btn:translate-x-1 transition-transform" />
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


// Solo renderizar si no estamos en Ladle/Storybook
if (typeof window !== 'undefined' && document.getElementById('root')) {
  const root = createRoot(document.getElementById('root')!);
  root.render(<CarAIRentingResults />);
}
