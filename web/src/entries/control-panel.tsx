import { param } from "@payloadcms/db-sqlite/drizzle";
import { act, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Checkbox,
  FileInput,
  Label,
  Radio,
  RangeSlider,
  Select,
  Textarea,
  TextInput,
  ToggleSwitch,
} from "flowbite-react";
import { userInfo } from "node:os";

// Inp
// ParameterType: 
// 1 o ninguno = texto
// 2 = numero
// 3 = radio button
//
const parametersToSpecify: {parameterId: string; parameterName: string; defaultValue?: string; parameterType?: number; parameterOptions?: string[]}[] = [
		{
			parameterId: "1a",
			parameterName: "Input1",
			defaultValue: "1aaaaaaaaa"
		},
		{
			parameterId: "2a",
			parameterName: "Input2"
		},
    {
      parameterId: "3a",
      parameterName: "Input3"
    },
    {
      parameterId: "4a",
      parameterName: "Input4",
      parameterType: 2,
    },
    {
      parameterId: "5a",
      parameterName: "Input5",
      parameterType: 3,
      parameterOptions: ["option1", "option2", "option3"],
    },
]


// const renderInput = (elem: typeof parametersToSpecify[0]) => {
//         if (elem.parameterType === 2) {
//             return (
//             <TextInput
//                 id={elem.parameterId}
//                 name={elem.parameterName}
//                 type="number"
//                 required
//             />
//             );
//         }

//         if (elem.parameterType === 3 && elem.parameterOptions) {
//             return (
//             <div className="flex max-w-md flex-col gap-4">
//                 {elem.parameterOptions.map((option) => (
//                 <div key={option} className="flex items-center gap-4">
//                     <Radio
//                     id={option}
//                     name={elem.parameterName}
//                     value={option}
//                     required
//                     />
//                    <Label htmlFor={option}>{option}</Label> 
//                 </div>
//                 ))}
//             </div>
//             );
//         }

//         return (
//             <TextInput
//             id={elem.parameterId}
//             name={elem.parameterName}
//             type="text"
//             defaultValue={elem.defaultValue ?? ""}
//             />
//         );
//     };

export default function Control() {
    const [value, setValue] = useState({})
    const [parameters, setParameters] = useState(parametersToSpecify)


    // Tipar la funcion que el elem tenga un tipo, tipar el parameters to specify
    // Luego comentar toda la funcion y ponerla en forma de ternarios en el render
    // Arreglar los estilos, cjas de input minimo de anchura, grid de columnas. Si caben más pues que se metan
    

  //RENDER
  //Cada vez que value se actualize que ejecute la función
  useEffect(() => {
    if(Object.keys(value).length !== 0 )console.log(value)
    }, [value]);


  return ( 
    <div className="space-y-8 antialiased p-2">
      {/* CABECERA DEL FORMULARIO */}
      <div
        className="
          bg-gradient-to-r
          from-slate-900
          via-slate-700
          to-slate-900
          rounded-[2.5rem]
          p-8
          text-white
          shadow-2xl
          border-b-4
          border-slate-600
          transition-all
          duration-500
        "
      >
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

      {/* CONTENIDO DEL FORMULARIO */}
      <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-slate-200">
        <form onSubmit={(e) => {
            e.preventDefault();
            // Uso de FormData
            const data = new FormData(e.target);
            const entries = Object.fromEntries(data.entries());
            console.log(entries)
            setValue(entries)
        }} className="flex flex-col gap-6 grid-rows-3 grid-cols-2 gap-4">
          <div className="grid grid-rows-3 grid-cols-2 gap-4">
            {parameters.map((elem) => (
              <div key={elem.parameterId} className="space-y-2">
                    <Label htmlFor={elem.parameterId} className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{elem.parameterName}</Label>
                    {/* {renderInput(elem)} */}
                    {elem.parameterType == undefined || elem.parameterType == 1 ?
                    <TextInput
                    id={elem.parameterId}
                    name={elem.parameterName}
                    type="text"
                    defaultValue={elem.defaultValue ?? ""}
                    />:<></>}
                    {elem.parameterType == 2 ?
                    <TextInput
                      id={elem.parameterId}
                      name={elem.parameterName}
                      type="number"
                      required
                    /> : <></>}
                    {elem.parameterType == 3 && elem.parameterOptions ?
                    <div className="flex max-w-md flex-col gap-4">
                      {elem.parameterOptions.map((option) => (
                        <div key={option} className="flex items-center gap-4">
                          <Radio
                          id={option}
                          name={elem.parameterName}
                          value={option}
                          required
                          />
                        <Label htmlFor={option}>{option}</Label> 
                      </div>
                      ))}
                    </div> : <></>}
                </div>
                // Ternario: condicional ? true : false
                // if (condicional) true else false
              ))}
              </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white font-bold py-3 px-6 rounded-xl transition duration-300 shadow-lg uppercase tracking-wide">Enviar</Button>
        </form>
      </div>
    </div>
    );
}

// RENDERIZADO FINAL
if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<Control />);
}