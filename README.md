# POC APPS OPENAI

## Comandos

- Componentes react en local con mocks

  ```sh
  npm run ladle
  ```

- Ejecución del servidor mcp

  ```sh
  npm run server
  ```

  > [!IMPORTANT]
  > Se debe de tener el certificado del zscaler `.pem` en una ruta accesible (por defecto `C:\certs\zscaler-root.pem`) para poder hacer las llamadas del servidor la BBDD.

- Inspeccionar el mcp server

  ```sh
  npm run mcp:inspector
  ```

  > [!WARNING]
  > Se debe tener el servidor mcp arrancado

  > [!NOTE]
  > Abrir la url que viene ya con el token en la opción `Open inspector with token pre-filled`.
  >
  > Meter la url de nuestro servidor mcp que por defecto es `http://localhost:3333/mcp` y conectarse.

## Creación de una nueva herramienta

Para crear una nueva herramienta (tool), es necesario crear los ficheros correspondientes y enlazarlos con los *resources* genéricos adecuados.  
Si la herramienta encaja con alguno de los diseños ya existentes, se deberá reutilizar dicho diseño.  
En caso de que solo sean necesarias pequeñas variaciones, se ampliará el diseño existente.  
Si los cambios son significativos y no encajan en ningún diseño actual, se deberá crear una nueva *template*.
