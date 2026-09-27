// components/viatura-list/viatura-list.component.ts
import {
  Component,
  computed,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Viatura } from '../../models/viatura.model';
import { ViaturaService } from '../../services/viatura.service';
import { AtendimentoService } from '../../services/atendimento.service';
import { GeoService } from '../../services/geo.service';

interface ViaturaComDistancia extends Viatura {
  distanciaKm: number;
  etaMin: number;
}

@Component({
  selector: 'app-viatura-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Estado: PENDENTE — mostra viaturas disponíveis dentro do raio -->
    @if (atendimento()?.status === 'pendente') {
      <div class="painel">
        <h3>Atendimento Pendente</h3>

        <label>
          Raio: {{ raioKm() }} km
          <input
            type="range"
            min="1" max="30" step="1"
            [value]="raioKm()"
            (input)="raioKm.set(+$any($event.target).value)"
          />
        </label>

        @if (viaturasDisponiveis().length > 0) {
          <ul>
            @for (v of viaturasDisponiveis(); track v.id) {
              <li>
                <strong>{{ v.descricao }}</strong>
                — {{ v.distanciaKm.toFixed(1) }} km
                — ETA ~{{ v.etaMin }} min
              </li>
            }
          </ul>
        } @else {
          <p>Nenhuma viatura disponível neste raio. Aumente o raio.</p>
        }
      </div>
    }

    <!-- Estado: ALOCADA — mostra viatura atual e ETA até o destino -->
    @if (atendimento()?.status === 'alocada') {
      <div class="painel">
        <h3>Viatura em Atendimento</h3>

        @if (viaturaAlocada(); as va) {
          <p><strong>{{ va.descricao }}</strong> está a caminho.</p>
          <p>Local do atendimento: {{ va.lat.toFixed(5) }}, {{ va.lng.toFixed(5) }}</p>

          @if (destinoEta(); as eta) {
            <p>
              Destino: {{ eta.destinoLat.toFixed(5) }}, {{ eta.destinoLng.toFixed(5) }}
            </p>
            <p>
              Distância até o destino: {{ eta.distanciaKm.toFixed(1) }} km
              — Tempo estimado: ~{{ eta.etaMin }} min
            </p>
          } @else {
            <p>Destino não definido.</p>
          }
        }
      </div>
    }
  `,
  styles: [
    `
    .painel { padding: 1rem; border: 1px solid #ccc; border-radius: 8px; }
    ul { list-style: none; padding: 0; }
    li { padding: 0.5rem 0; border-bottom: 1px solid #eee; }
  `,
  ],
})
export class ViaturaListComponent {
  private viaturaService = inject(ViaturaService);
  private atendimentoService = inject(AtendimentoService);
  private geo = inject(GeoService);

  // Signals expostos ao template
  readonly atendimento = this.atendimentoService.atendimento;
  readonly viaturas = this.viaturaService.viaturas;

  /** Raio configurável pelo usuário (km) */
  readonly raioKm = signal(5);

  /** Viatura atualmente alocada (quando status = 'alocada') */
  readonly viaturaAlocada = computed(() => {
    const at = this.atendimento();
    if (!at || at.status !== 'alocada' || !at.viaturaAlocadaId) return null;
    return this.viaturas().find((v) => v.id === at.viaturaAlocadaId) ?? null;
  });

  /** Viaturas disponíveis dentro do raio, ordenadas por distância */
  readonly viaturasDisponiveis = computed<ViaturaComDistancia[]>(() => {
    const at = this.atendimento();
    if (!at || at.status !== 'pendente') return [];

    const raio = this.raioKm();

    return this.viaturas()
      .filter((v) => v.status === 'disponivel')
      .map((v) => {
        const dist = this.geo.distanciaKm(at.lat, at.lng, v.lat, v.lng);
        return {
          ...v,
          distanciaKm: dist,
          etaMin: this.geo.etaMinutos(dist),
        };
      })
      .filter((v) => v.distanciaKm <= raio)
      .sort((a, b) => a.distanciaKm - b.distanciaKm);
  });

  /** ETA até o destino (só quando status = 'alocada' e há destino) */
  readonly destinoEta = computed(() => {
    const at = this.atendimento();
    const va = this.viaturaAlocada();

    if (!at || !va || at.destinoLat == null || at.destinoLng == null)
      return null;

    const dist = this.geo.distanciaKm(
      va.lat,
      va.lng,
      at.destinoLat,
      at.destinoLng
    );
    return {
      destinoLat: at.destinoLat,
      destinoLng: at.destinoLng,
      distanciaKm: dist,
      etaMin: this.geo.etaMinutos(dist),
    };
  });
}
