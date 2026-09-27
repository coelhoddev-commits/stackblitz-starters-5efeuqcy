// services/viatura.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Viatura } from '../models/viatura.model';

@Injectable({ providedIn: 'root' })
export class ViaturaService {
  private http = inject(HttpClient);

  private _viaturas = signal<Viatura[]>([]);
  readonly viaturas = this._viaturas.asReadonly();

  constructor() {
    // Atualiza a cada 10s — padrão comum em sistemas de rastreamento
    timer(0, 10000)
      .pipe(
        switchMap(() =>
          this.http.get<Viatura[]>('/api/viaturas').pipe(
            catchError(() => of([] as Viatura[]))
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe(data => this._viaturas.set(data));
  }
}