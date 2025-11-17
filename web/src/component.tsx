import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
// import { useWidgetState } from "./use-widget-state";

// declare global {
//   interface Window {
//     openai: API & OpenAiGlobals;
//   }

//   interface WindowEventMap {
//     [SET_GLOBALS_EVENT_TYPE]: SetGlobalsEvent;
//   }
// }

// type OpenAiGlobals<
//   ToolInput extends UnknownObject = UnknownObject,
//   ToolOutput extends UnknownObject = UnknownObject,
//   ToolResponseMetadata extends UnknownObject = UnknownObject,
//   WidgetState extends UnknownObject = UnknownObject
// > = {
//   theme: Theme;
//   userAgent: UserAgent;
//   locale: string;

//   // layout
//   maxHeight: number;
//   displayMode: DisplayMode;
//   safeArea: SafeArea;

//   // state
//   toolInput: ToolInput;
//   toolOutput: ToolOutput | null;
//   toolResponseMetadata: ToolResponseMetadata | null;
//   widgetState: WidgetState | null;
// };

// type API<WidgetState extends UnknownObject> = {
//   /** Calls a tool on your MCP. Returns the full response. */
//   callTool: (
//     name: string,
//     args: Record<string, unknown>
//   ) => Promise<CallToolResponse>;

//   /** Triggers a followup turn in the ChatGPT conversation */
//   sendFollowUpMessage: (args: { prompt: string }) => Promise<void>;

//   /** Opens an external link, redirects web page or mobile app */
//   openExternal(payload: { href: string }): void;

//   /** For transitioning an app from inline to fullscreen or pip */
//   requestDisplayMode: (args: { mode: DisplayMode }) => Promise<{
//     /**
//      * The granted display mode. The host may reject the request.
//      * For mobile, PiP is always coerced to fullscreen.
//      */
//     mode: DisplayMode;
//   }>;

//   setWidgetState: (state: WidgetState) => Promise<void>;
// };

// // Dispatched when any global changes in the host page
// export const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";
// export class SetGlobalsEvent extends CustomEvent<{
//   globals: Partial<OpenAiGlobals>;
// }> {
//   readonly type = SET_GLOBALS_EVENT_TYPE;
// }

// export type CallTool = (
//   name: string,
//   args: Record<string, unknown>
// ) => Promise<CallToolResponse>;

// export type DisplayMode = "pip" | "inline" | "fullscreen";

// export type Theme = "light" | "dark";

// export type SafeAreaInsets = {
//   top: number;
//   bottom: number;
//   left: number;
//   right: number;
// };

// export type SafeArea = {
//   insets: SafeAreaInsets;
// };

// export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

// export type UserAgent = {
//   device: { type: DeviceType };
//   capabilities: {
//     hover: boolean;
//     touch: boolean;
//   };
// };

// export function useOpenAiGlobal<K extends keyof OpenAiGlobals>(
//   key: K
// ): OpenAiGlobals[K] {
//   return useSyncExternalStore(
//     (onChange) => {
//       const handleSetGlobal = (event: SetGlobalsEvent) => {
//         const value = event.detail.globals[key];
//         if (value === undefined) {
//           return;
//         }

//         onChange();
//       };

//       window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
//         passive: true,
//       });

//       return () => {
//         window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
//       };
//     },
//     () => window.openai[key]
//   );
// }

// export function useToolInput() {
//   return useOpenAiGlobal("toolInput");
// }

// export function useToolOutput() {
//   return useOpenAiGlobal("toolOutput");
// }

// export function useToolResponseMetadata() {
//   return useOpenAiGlobal("toolResponseMetadata");
// }

// ---------------------------------------------------------------------------

interface PokemonType {
  type: { name: string };
}

interface Pokemon {
  id: number;
  name: string;
  sprites: { front_default: string };
  types: PokemonType[];
}

function Card({ pokemon }: { pokemon: Pokemon }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "1rem",
        textAlign: "center",
      }}
    >
      <img
        src={pokemon.sprites?.front_default}
        alt={pokemon.name}
        width={100}
        height={100}
      />
      <h3 style={{ textTransform: "capitalize" }}>{pokemon.name}</h3>
      <p>
        <strong>Tipo:</strong>{" "}
        {pokemon.types.map((t: PokemonType) => t.type.name).join(", ")}
      </p>
    </div>
  );
}

function List({ pokemons }: { pokemons: Pokemon[] }) {
  if (!pokemons) {
    return <div>No hay pokemons</div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "1rem",
      }}
    >
      {pokemons.map((p: Pokemon) => (
        <Card key={p.id} pokemon={p} />
      ))}
    </div>
  );
}

export default function App(results: any) {
  console.error("Datos recibidos en el App", results);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Pokédex React {results.length}</h1>
      <List pokemons={results} />
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
