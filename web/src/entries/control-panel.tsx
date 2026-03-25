import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Button, Label, Radio } from "flowbite-react";
import { useOpenAiGlobal } from '../lib/hooks.js';

const parmRetail: {parameterId: string; parameterName: string; defaultValue?: string; parameterOptions?: string[]}[] = [
    { parameterId: "tiempo", parameterName: "Tiempo", defaultValue: "", parameterOptions: ["frio", "calido", "lluvia", "templado"] },
    { parameterId: "genero", parameterName: "Genero", defaultValue: "", parameterOptions: ["hombre", "mujer", "unisex", "kids"] },
    { parameterId: "ocasion", parameterName: "Ocasion", defaultValue: "", parameterOptions: ["boda", "oficina", "fiesta", "deporte", "diario"] }
]

export default function Control() {
    const toolOutput = useOpenAiGlobal('toolOutput');
    const [parameters, setParameters] = useState(parmRetail);

    useEffect(() => {
        try {
           
            const camposQueFaltan = (toolOutput as any)?.missingFields || [];

            if (camposQueFaltan.length > 0) {
                const parametrosFiltrados = parmRetail.filter(param => 
                    camposQueFaltan.includes(param.parameterId)
                );
                setParameters(parametrosFiltrados);
            }
        } catch (error) {
            console.error("Error procesando los datos:", error);
        }
    }, [toolOutput]);

   
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const entries = Object.fromEntries(data.entries());
        
        console.log("Enviando selecciones:", entries);

       
        const opcionesElegidas = Object.entries(entries)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');

        
        const mensajeParaChat = `Aquí tienes las opciones que faltaban: ${opcionesElegidas}. Por favor, procede a buscar los looks en el catálogo con estos datos.`;

        
        if ((window as any).openai?.sendFollowUpMessage) {
            await (window as any).openai.sendFollowUpMessage({
                prompt: mensajeParaChat
            });
        } else {
            console.error("No se ha encontrado el objeto window.openai");
        }
    };

  return ( 
    <div className="space-y-8 antialiased p-2">
      <div className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border-b-4 border-slate-600 transition-all duration-500">
        <div className="flex flex-col justify-center items-center gap-6">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight leading-none text-white uppercase italic">
              Formulario de Control
            </h1>
            <p className="text-white/60 text-sm font-medium italic mt-2">
              Configura los parámetros necesarios
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-slate-200">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 grid-rows-3 grid-cols-2 gap-4">
            {parameters.map((elem) => (
              <div key={elem.parameterId} className="space-y-2">
                <Label htmlFor={elem.parameterId} className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{elem.parameterName}</Label>
                <div>
                  {elem.parameterOptions?.map((option) => (
                    <div key={option} className="flex items-center gap-4">
                      <Radio
                      id={`${elem.parameterId}-${option}`}
                      name={elem.parameterId} 
                      value={option}
                      required
                      defaultValue={elem.defaultValue ?? ""}/>
                      <Label htmlFor={`${elem.parameterId}-${option}`}>{option}</Label>
                    </div>
                  ))}
                </div> 
              </div>
              ))}
            <Button type="submit" className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white font-bold py-3 px-6 rounded-xl transition duration-300 shadow-lg uppercase tracking-wide">Enviar</Button>
        </form>
      </div>
    </div>
    );
}

if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<Control />);
}