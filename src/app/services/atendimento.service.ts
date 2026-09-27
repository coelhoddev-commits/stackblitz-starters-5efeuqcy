// services/atendimento.service.ts
import { Injectable, signal } from '@angular/core';
import { Atendimento } from '../models/viatura.model';

@Injectable({ providedIn: 'root' })
export class AtendimentoService {
  private _atendimento = signal<Atendimento | null>(null);
  readonly atendimento = this._atendimento.asReadonly();

  // Chamado externamente (WebSocket, componente pai, etc.)
  receberAtendimento(at: Atendimento) {
    this._atendimento.set(at);
  }

  limpar() {
    this._atendimento.set(null);
  }
}
