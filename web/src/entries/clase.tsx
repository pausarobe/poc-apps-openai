import { param } from "@payloadcms/db-sqlite/drizzle";
import { act, useState } from "react";
import { createRoot } from "react-dom/client";

// Inp

const parametersToSpecify = [
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
    }
]

// Recorrer, montar un nuevo objeto y enviar ese objeto
const aux = (defaultParameters: Array<{parameterId: string, parameterName: string, defaultValue?: string}>):Record<string, string> => {
  // defaultParameters.forEach((elem) => {
  // }

  const result: Record<string, string> = {};

  defaultParameters.forEach((elem) => {
    if (elem.defaultValue !== undefined) result[elem.parameterId] = elem.defaultValue;
  });

  return result;
}

export default function Clase() {
  //LOGICA
  // value = {
  //   Input1: "hola"
  // }
  // Que empiece con los defaultValue
  const [values, setValues] = useState<Record<string, string>>(aux(parametersToSpecify));
    const [actualizar, setActualizar] = useState(false);
    const [valoresActualizados, setValoresActualizados] = useState<Record<string, string>>({});

    function mostrar() {
      setValoresActualizados(values);
      setActualizar(true);
    }

    function guardarDatos (id: string, value: string) {
      setValues({...values,[id]: value });
    }

  //RENDER
  return ( 
    <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
    {parametersToSpecify.map((elem) => (
        <div key={elem.parameterId}>
          <label>{elem.parameterName}</label>
          <input type="text" defaultValue={elem.defaultValue ?? ""} onChange={(e) => guardarDatos(elem.parameterId, e.target.value)} />
        </div>
      ))}

    <button onClick={mostrar} style={{backgroundColor: "blue", padding: "0.5rem 1rem", borderRadius: "0.25rem"}}>Mostrar</button>
    {actualizar && (
      <div>
        <h3>Valores ingresados:</h3>
        {parametersToSpecify.map((elem) => (
          <div key={elem.parameterId}>
            <strong>{elem.parameterName}:</strong> {valoresActualizados[elem.parameterId] || "No ingresado"}
          </div>
        ))}
      </div>
    )}
    </div>


    );
}

// RENDERIZADO FINAL
if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<Clase />);
}