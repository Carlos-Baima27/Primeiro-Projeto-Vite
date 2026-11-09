export const categories = [
  "alimento",
  "transporte",
  "lazer",
  "saúde",
  "outros",
] as const;

export type Categoria = (typeof categories)[number];

export function isCategoria(value: string): value is Categoria {
  return categories.some((category) => category === value);
}

export type Despesa = {
  id: string;
  titulo: string;
  valor: number;
  categoria: Categoria;
};
