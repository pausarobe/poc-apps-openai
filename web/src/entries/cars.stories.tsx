
import { CarAIRentingResults } from './car-components'; // Sin el .js
import { CarDetail } from './car-detail'; // Sin el .js
import carsData from '../mock/cars.json' with { type: 'json' };

export default {
  title: 'Coches IA',
};

// --- HISTORIA 1: Catálogo (Ahora recibe datos) ---
export const CatalogoCochesIA = () => {
  // Extraemos los coches del JSON local
  const items = (carsData as any).items || (Array.isArray(carsData) ? carsData : []);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px' }}>
      <CarAIRentingResults cars={items} />
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