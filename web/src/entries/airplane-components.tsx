import { createRoot } from 'react-dom/client';
import type { Airplane } from '../lib/types.js';
import { useOpenAiGlobal } from '../lib/hooks.js';

function Card({ airplane }: { airplane: Airplane }) {
  console.log('Card', airplane);
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '10px',
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      <h3 style={{ textTransform: 'capitalize' }}>{airplane.production_line}</h3>
    </div>
  );
}

function List({ airplanes }: { airplanes: Airplane[] }) {
  console.log('List', airplanes);
  if (airplanes.length === 0) {
    return <div>No hay airplanes</div>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1rem',
      }}
    >
      {airplanes.map((p: Airplane) => (
        <Card key={p.iata_code_long} airplane={p} />
      ))}
    </div>
  );
}

export default function App() {
  const toolOutput = useOpenAiGlobal('toolOutput');
  console.error('toolOutput', toolOutput);
  const airplanes = toolOutput?.airplaneList ?? [];
  console.error('airplanes', airplanes);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Airplanes React {airplanes?.length}</h1>
      <List airplanes={airplanes} />
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
