// types.ts
export interface ItemCarrinho {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  quantidade?: number;
  imagem?: string;
  opcoes?: OpcaoItem[];
  opcaoSelecionada?: string;
  opcoesSelecionadas?: string[];
}

export type OpcaoItem = 
  | string 
  | { nome: string; preco?: number };

export interface TaxaEntrega {
  regiao: string;
  valor: number;
}

export interface Localizacao {
  latitude: number;
  longitude: number;
}

export interface PedidoCompleto {
  numeroPedido: string;
  itens: ItemCarrinho[];
  cliente: {
    nome: string;
    telefone: string;
    endereco: string;
    regiao: string;
    localizacao?: Localizacao | null;
    observacoes?: string;
  };
  pagamento: string;
  taxaEntrega: number;
}