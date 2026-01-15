
import { CarAIRentingResults } from './car-dashboard'; // Sin el .js
import { CarDetail } from './car-detail'; // Sin el .js
import carsData from '../mock/cars.json' with { type: 'json' };
import { useEffect } from 'react';
import type { CarData } from '../lib/types';

export default {
  title: 'Coches IA',
};

function MockToolOutput({ carList, children }: { carList: CarData[]; children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openai = {
        toolOutput: {
          carList,
          type: 'arrival',
        },
      } as any;

      window.dispatchEvent(new Event('openai:set_globals'));
    }
  }, [carList]);

  return <>{children}</>;
}

// --- HISTORIA 1: Catálogo (Ahora recibe datos) ---
export const CatalogoCochesIA = () => {
  // Extraemos los coches del JSON local
  const items = (carsData as any).items || (Array.isArray(carsData) ? carsData : []);
  console.log('Número de coches en el mock:', items);
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px' }}>
      <MockToolOutput carList={items} >
        <CarAIRentingResults />
      </MockToolOutput>
    </div>
  );
};

// --- HISTORIA 2: Detalle ---
export const FichaDetalleCoche = () => {
  const items = (carsData as any).items || (Array.isArray(carsData) ? carsData : []);
  const primerCoche = items[0];

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px' }}>
      <CarDetail car={primerCoche} />
    </div>
  );
};