// app.component.ts
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ViaturaListComponent } from './components/viatura-list/viatura-list.component';
import { MapaComponent } from './components/mapa/mapa.component';
import { AtendimentoService } from './services/atendimento.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ViaturaListComponent, MapaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Gestão de Viaturas</h1>

    <!-- Simulação: botões para receber atendimentos em cada estado -->
    <div style="margin-bottom: 1rem;">
      <button (click)="simularPendente()">Simular Atendimento Pendente</button>
      <button (click)="simularAlocada()">Simular Atendimento Alocado</button>
    </div>

    <app-viatura-list />
    <app-mapa />
  `,
})
export class AppComponent {
  private atendimentoService = inject(AtendimentoService);

  simularPendente() {
    this.atendimentoService.receberAtendimento({
      id: 'AT-001',
      lat: -23.5505,
      lng: -46.6333,
      status: 'pendente',
    });
  }

  simularAlocada() {
    this.atendimentoService.receberAtendimento({
      id: 'AT-001',
      lat: -23.5505,
      lng: -46.6333,
      status: 'alocada',
      viaturaAlocadaId: 'V-01', // Assume que essa viatura existe
      destinoLat: -23.561,
      destinoLng: -46.65,
    });
  }
}
