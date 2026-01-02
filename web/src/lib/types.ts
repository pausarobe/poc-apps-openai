export interface PokemonType {
  type: { name: string };
}

export interface Pokemon {
  id: number;
  name: string;
  img: string;
  types: PokemonType[];
}

export interface Airplane {
  iata_code_long: string;
  production_line: string;
  model_name: string;
}