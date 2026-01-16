
import { Card, Badge, Button as FlowbiteButton } from 'flowbite-react';
import { HiTruck,  HiLightningBolt, HiChip } from 'react-icons/hi';
import { useOpenAiGlobal } from '../lib/hooks.js';
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import type { CarData } from '../lib/types.js';

const Button = FlowbiteButton as any;

const getAttrValue = (attributes: any[], code: string) => {
  if (!Array.isArray(attributes)) return null;
  return attributes.find((attr: any) => attr.attribute_code === code)?.value;
};


export default function CarDetail() {
  const [car, setCar] = useState<CarData>();
  const toolOutput = useOpenAiGlobal('toolOutput');

//  const car = initialCar || toolOutput?.carDetail || null;

useEffect(() => {
    async function getCarData() {
      try {
        const carDetail = toolOutput?.carDetail || undefined ;
        console.log('Car Detail:', carDetail);
        console.log('Type:', toolOutput?.type);

        if (carDetail) {
          setCar(carDetail);
        }
      } catch (error) {
        console.error('Error fetching carDetail data:', error);
      }
    }

    getCarData();
  }, [toolOutput]);
  
  if (!car) {
    return (
      <div className="p-8 text-center text-gray-500 italic bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
        Esperando datos del vehículo...
      </div>
    );
  }

  const data = {
    desc: getAttrValue(car.custom_attributes, 'descripcion') || "Sin descripción disponible.",
    km: getAttrValue(car.custom_attributes, 'kilometros_max') || 0,
    motor: getAttrValue(car.custom_attributes, 'tipo_motor') || "N/A",
    cuota: getAttrValue(car.custom_attributes, 'cuota_renting') || 0,
    seguro: getAttrValue(car.custom_attributes, 'coste_seguro') || "0",
    mantenimiento: getAttrValue(car.custom_attributes, 'coste_mantenimiento') || 0,
    reparaciones: getAttrValue(car.custom_attributes, 'coste_reparaciones') || 0,
  };

  // const imgPrueba = new URL('../mock/Modelo_electrico.jpg', import.meta.url).href;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen antialiased font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabecera Estilo Boarding Pass */}
        <Card className="border-t-8 border-blue-600 shadow-2xl rounded-3xl overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-2">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg animate-pulse">
                <HiLightningBolt className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{car.name}</h1>
                <div className="flex gap-2 mt-2">
                  <Badge color="info" className="px-3">SKU: {car.sku}</Badge>
                  <Badge color="purple" className="px-3 uppercase font-bold">{data.motor}</Badge>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 shadow-sm min-w-[200px]">
              <p className="text-xs text-blue-500 uppercase font-bold tracking-widest mb-1">Cuota Renting</p>
              <p className="text-5xl font-black text-blue-700">{Math.round(Number(data.cuota))}€<small className="text-lg font-normal">/mes</small></p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna Imagen y Descripción */}
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden border-none shadow-xl rounded-[2.5rem]">
              {/* https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/media/catalog/product/m/o/modelo_electrico.jpg */}
              <img src={`https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/media/catalog/product/${car.media_gallery_entries[0]?.file}`} alt={car.name} className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500" />
              <div className="p-8 bg-white">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-xl">
                  <HiChip className="text-blue-500 w-6 h-6" /> Detalles del Asistente
                </h4>
                <p className="text-gray-600 leading-relaxed italic border-l-4 border-blue-200 pl-6 text-lg">
                  "{data.desc}"
                </p>
              </div>
            </Card>
          </div>

          {/* Columna Tabla Técnica (HTML puro con Tailwind) */}
          <Card className="shadow-xl border-none rounded-[2.5rem] p-6 bg-white flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <HiTruck className="text-blue-600 w-8 h-8" /> Resumen del Contrato
              </h3>
              
              <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-gray-100">
                    <tr className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 text-gray-400 font-semibold text-lg">Uso Anual</td>
                      <td className="px-6 py-5 text-right font-black text-gray-900 text-xl">{Math.round(Number(data.km))} km</td>
                    </tr>
                    <tr className="bg-gray-50/30 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 text-gray-400 font-semibold text-lg">Seguro</td>
                      <td className="px-6 py-5 text-right">
                        <Badge color="success" size="lg" className="inline-block px-4 font-bold">
                          {data.seguro === "0.000000" ? "INCLUIDO" : `${Math.round(Number(data.seguro))}€`}
                        </Badge>
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 text-gray-400 font-semibold text-lg">Mantenimiento</td>
                      <td className="px-6 py-5 text-right font-black text-gray-900 text-xl">{Math.round(Number(data.mantenimiento))}€</td>
                    </tr>
                    <tr className="bg-gray-50/30 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 text-gray-400 font-semibold text-lg">Reparaciones</td>
                      <td className="px-6 py-5 text-right font-black text-gray-900 text-xl">{Math.round(Number(data.reparaciones))}€</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-10">
              <Button size="xl" gradientDuoTone="purpleToBlue" className="w-full shadow-2xl font-black tracking-widest uppercase py-5 rounded-[1.5rem] text-xl transform hover:scale-[1.02] transition-all">
                Confirmar Selección
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
if (typeof window !== 'undefined' && document.getElementById('root')) {
  const root = createRoot(document.getElementById('root')!);
  root.render(<CarDetail />);
}