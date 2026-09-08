export type Categoria =
  | "alimento"
  | "transporte"
  | "lazer"
  | "saúde"
  | "outros";

export type Despesa = {
  id: string;
  titulo: string;
  valor: number;
  categoria: Categoria;
};
