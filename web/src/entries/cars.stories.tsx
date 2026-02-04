
import  CarAIRentingResults  from './car-dashboard'; // Sin el .js

import carsData from '../mock/cars.json' with { type: 'json' };
import { useEffect } from 'react';
import type { CarData } from '../lib/types';
import CarDetail from './car-detail';
import CarCreate from './car-create';

export default {
  title: 'Coches IA',
};

function MockToolOutput({ carList, carDetail, carCreate, showForm, children }: { carList?: CarData[]; carDetail?: CarData; carCreate?: CarData; showForm?: boolean; children: React.ReactNode }) {
  useEffect(() => {
    // Note: Story files are for visual development only.
    // Real MCP Apps use the MCP transport layer, not window.openai
    if (typeof window !== 'undefined') {
      (window as any).openai = {
        toolOutput: {
          carList,
          carDetail,
          carCreate,
          showForm
        },
      };

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
      <MockToolOutput carDetail={primerCoche}>
        <CarDetail/>
      </MockToolOutput>
    </div>
  );
};
// --- HISTORIA 3: Formulario de Alta de Coche ---
export const FormularioAltaCoche = () => {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px' }}>
      
      <MockToolOutput showForm={true}>
        <CarCreate />
      </MockToolOutput>
    </div>
  );
};