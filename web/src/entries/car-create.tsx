import { Card, Label, TextInput, Select, Badge, Alert } from 'flowbite-react';
import { HiLightningBolt, HiTruck, HiCheckCircle } from 'react-icons/hi'; // Añadido HiCheckCircle
import { useOpenAiGlobal } from '../lib/hooks.js';
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';

export default function CarCreateForm() {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // Estado para el mensaje de éxito
  
  // Corregido: Se añade la clave obligatoria 'toolOutput'
  const toolOutput = useOpenAiGlobal('toolOutput') as any;

  useEffect(() => {
    if (toolOutput?.showForm) {
      setShowForm(true);
    }
  }, [toolOutput]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setShowSuccess(false);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      
      const openai = (window as any).openai;
      if (openai?.callTool) {
        await openai.callTool('create-car', {
          ...payload,
          price: Number(payload.price),
          cuota_renting: Number(payload.cuota_renting),
          kilometros_max: Number(payload.kilometros_max),
          coste_seguro: Number(payload.coste_seguro),
          coste_mantenimiento: Number(payload.coste_mantenimiento),
          coste_reparaciones: Number(payload.coste_reparaciones),
        });
        
        // Activamos el mensaje de éxito tras la creación
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="p-8 text-center text-gray-500 italic bg-white rounded-3xl border border-dashed border-gray-200">
        Esperando datos del asistente para abrir el formulario...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen antialiased font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <Card className="border-t-8 border-blue-600 shadow-2xl rounded-3xl">
          <div className="flex items-center gap-4 p-2">
            <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg">
              <HiLightningBolt className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Alta de Vehículo</h1>
              <div className="flex gap-2 mt-2">
                <Badge color="info">NUEVO REGISTRO</Badge>
                <Badge color="purple" className="uppercase font-bold">SET ATRIBUTOS 15</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="shadow-xl border-none rounded-[2.5rem] p-6 bg-white">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <HiTruck className="text-blue-600 w-8 h-8" /> Datos Técnicos del Renting
          </h3>

          
          {showSuccess && (
            <Alert 
              color="success" 
              icon={HiCheckCircle as any} 
              className="mb-8 rounded-2xl shadow-sm border border-emerald-100"
            >
              <span className="font-bold text-lg">¡Coche creado!</span> El registro se ha completado correctamente en Magento Cloud.
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nombre comercial</Label>
              <TextInput id="name" name="name" placeholder="Ej: Tesla Model 3" required />
            </div>

            <div>
              <Label htmlFor="sku">SKU (Referencia)</Label>
              <TextInput id="sku" name="sku" placeholder="PROD-001" required />
            </div>

            <div>
              <Label htmlFor="price">Precio de Venta (€)</Label>
              <TextInput id="price" name="price" type="number" required />
            </div>

            <div>
              <Label htmlFor="tipo_motor">Motorización</Label>
              <Select id="tipo_motor" name="tipo_motor" required>
                <option value="Eléctrico">Eléctrico</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Combustión">Combustión</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="cuota_renting">Cuota Mensual (€)</Label>
              <TextInput id="cuota_renting" name="cuota_renting" type="number" required />
            </div>

            <div>
              <Label htmlFor="coste_seguro">Coste Seguro (€)</Label>
              <TextInput id="coste_seguro" name="coste_seguro" type="number" required />
            </div>

            <div>
              <Label htmlFor="kilometros_max">KM Máximos/Año</Label>
              <TextInput id="kilometros_max" name="kilometros_max" type="number" required />
            </div>

      
            <div className="md:col-span-2 mt-8">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase py-5 rounded-[1.5rem] text-xl shadow-2xl transform hover:scale-[1.02] transition-all disabled:bg-gray-400"
              >
                {loading ? 'Sincronizando...' : 'Confirmar y Crear Vehículo'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined' && document.getElementById('root')) {
  const root = createRoot(document.getElementById('root')!);
  root.render(<CarCreateForm />);
}