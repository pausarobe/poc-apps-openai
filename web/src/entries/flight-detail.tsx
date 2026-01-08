import { createRoot } from 'react-dom/client';
import { Button } from 'flowbite-react';

export default function FlightDetail() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-4xl font-bold mb-8">Flight Detail Component</h1>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Flowbite React Buttons</h2>

        <div className="flex flex-wrap gap-4">
          <Button>Default Button</Button>
          <Button color="blue">Blue Button</Button>
          <Button color="gray">Gray Button</Button>
          <Button color="dark">Dark Button</Button>
          <Button color="light">Light Button</Button>
          <Button color="success">Success Button</Button>
          <Button color="failure">Failure Button</Button>
          <Button color="warning">Warning Button</Button>
          <Button color="purple">Purple Button</Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button pill>Pill Button</Button>
          <Button outline>Outline Button</Button>
          <Button color="info" outline>Info Outline</Button>
          <Button disabled>Disabled Button</Button>
        </div>
      </div>

      <div className="bg-red-500 text-white p-4 rounded-lg">
        Test Tailwind funcionando correctamente
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<FlightDetail />);
