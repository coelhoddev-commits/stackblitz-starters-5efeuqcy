// models/viatura.model.ts
export type ViaturaStatus = 'disponivel' | 'alocada' | 'fora_servico';

export interface Viatura {
  id: string;
  descricao: string;
  lat: number;
  lng: number;
  status: ViaturaStatus;
}

export type AtendimentoStatus = 'pendente' | 'alocada';

export interface Atendimento {
  id: string;
  lat: number;
  lng: number;
  status: AtendimentoStatus;
  viaturaAlocadaId?: string; // Obrigatório quando status = 'alocada'
  destinoLat?: number; // Coordenadas do destino
  destinoLng?: number;
}
