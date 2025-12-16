import type { Pokemon } from "./types.js";

export interface ToolOutput {
  pokemonList?: Pokemon[];
  pokemonDetail?: PokemonDetail;
}

export interface PokemonDetail {
  name: string;
  weight: number;
  height: number;
  sprites: {
    front_default: string;
    back_default: string;
    front_shiny: string;
    back_shiny: string;
  };
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
}
