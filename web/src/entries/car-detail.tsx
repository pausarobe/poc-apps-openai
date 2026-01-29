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
      /* Uso de tokens para el estado de carga */
      <div className="p-8 text-center text-token-text-secondary italic bg-token-main-surface-secondary rounded-3xl border border-dashed border-token-border-medium">
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
    /* bg-token-main-surface-primary para el fondo principal */
    <div className="p-4 md:p-8 bg-token-main-surface-primary antialiased font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabecera con tokens de superficie y borde */}
        <Card className="bg-token-main-surface-secondary border-t-8 border-blue-600 border-x-token-border-medium border-b-token-border-medium shadow-2xl rounded-3xl overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-2">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg animate-pulse">
                <HiLightningBolt className="w-8 h-8" />
              </div>
              <div>
                {/* text-token-text-primary para el título */}
                <h1 className="text-3xl font-black text-token-text-primary tracking-tight">{car.name}</h1>
                <div className="flex gap-2 mt-2">
                  <Badge color="info" className="px-3">SKU: {car.sku}</Badge>
                  <Badge color="purple" className="px-3 uppercase font-bold">{data.motor}</Badge>
                </div>
              </div>
            </div>
            {/* Bloque de precio con superficie terciaria */}
            <div className="text-center md:text-right bg-token-main-surface-tertiary p-6 rounded-3xl border border-token-border-light shadow-sm min-w-[200px]">
              <p className="text-xs text-blue-500 uppercase font-bold tracking-widest mb-1">Cuota Renting</p>
              <p className="text-5xl font-black text-blue-700">{Math.round(Number(data.cuota))}€<small className="text-lg font-normal">/mes</small></p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden border-token-border-medium shadow-xl rounded-[2.5rem] bg-token-main-surface-secondary">
             {/* https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/media/catalog/product/m/o/modelo_electrico.jpg */}
              <img src={`https://poc-aem-ac-3sd2yly-l5m7ecdhyjm4m.eu-4.magentosite.cloud/media/catalog/product/${car.media_gallery_entries[0]?.file}`} alt={car.name} className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500" />
              <div className="p-8">
                <h4 className="font-bold text-token-text-primary mb-4 flex items-center gap-2 text-xl">
                  <HiChip className="text-blue-500 w-6 h-6" /> Detalles del Asistente
                </h4>
                <p className="text-token-text-secondary leading-relaxed italic border-l-4 border-blue-200 pl-6 text-lg">
                  "{data.desc}"
                </p>
              </div>
            </Card>
          </div>

          <Card className="shadow-xl border-token-border-medium rounded-[2.5rem] p-6 bg-token-main-surface-secondary flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-token-text-primary mb-8 flex items-center gap-3">
                <HiTruck className="text-blue-600 w-8 h-8" /> Resumen del Contrato
              </h3>
              
              <div className="overflow-hidden rounded-2xl border border-token-border-light shadow-sm">
                <table className="w-full text-left border-collapse">
                  {/* divide-token-border-light para las líneas de la tabla */}
                  <tbody className="divide-y divide-token-border-light">
                    <tr className="bg-token-main-surface-secondary hover:bg-token-main-surface-tertiary transition-colors">
                      <td className="px-6 py-5 text-token-text-tertiary font-semibold text-lg">Uso Anual</td>
                      <td className="px-6 py-5 text-right font-black text-token-text-primary text-xl">{Math.round(Number(data.km))} km</td>
                    </tr>
                    <tr className="bg-token-main-surface-tertiary/30 hover:bg-token-main-surface-tertiary transition-colors">
                      <td className="px-6 py-5 text-token-text-tertiary font-semibold text-lg">Seguro</td>
                      <td className="px-6 py-5 text-right">
                        <Badge color="success" size="lg" className="inline-block px-4 font-bold">
                          {data.seguro === "0.000000" ? "INCLUIDO" : `${Math.round(Number(data.seguro))}€`}
                        </Badge>
                      </td>
                    </tr>
                    <tr className="bg-token-main-surface-secondary hover:bg-token-main-surface-tertiary transition-colors">
                      <td className="px-6 py-5 text-token-text-tertiary font-semibold text-lg">Mantenimiento</td>
                      <td className="px-6 py-5 text-right font-black text-token-text-primary text-xl">{Math.round(Number(data.mantenimiento))}€</td>
                    </tr>
                    <tr className="bg-token-main-surface-tertiary/30 hover:bg-token-main-surface-tertiary transition-colors">
                      <td className="px-6 py-5 text-token-text-tertiary font-semibold text-lg">Reparaciones</td>
                      <td className="px-6 py-5 text-right font-black text-token-text-primary text-xl">{Math.round(Number(data.reparaciones))}€</td>
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