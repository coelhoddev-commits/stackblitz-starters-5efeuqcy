// components/mapa/mapa.component.ts
import {
  Component,
  ElementRef,
  viewChild,
  afterNextRender,
  effect,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import * as L from 'leaflet';
import { ViaturaService } from '../../services/viatura.service';
import { AtendimentoService } from '../../services/atendimento.service';

@Component({
  selector: 'app-mapa',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #mapContainer style="height: 400px;"></div>`,
})
export class MapaComponent {
  private mapContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private viaturaService = inject(ViaturaService);
  private atendimentoService = inject(AtendimentoService);

  private map!: L.Map;
  private markers = new Map<string, L.Marker>();

  constructor() {
    afterNextRender(() => this.initMap());

    // Atualiza marcadores quando a lista de viaturas muda
    effect(() => {
      const viaturas = this.viaturaService.viaturas();
      if (!this.map) return;
      this.updateMarkers(viaturas);
    });

    // Mostra marcador do atendimento
    effect(() => {
      const at = this.atendimentoService.atendimento();
      if (!this.map || !at) return;
      L.marker([at.lat, at.lng], { title: 'Atendimento' }).addTo(this.map);
    });
  }

  private initMap() {
    this.map = L.map(this.mapContainer().nativeElement).setView(
      [-23.55, -46.63],
      13
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  private updateMarkers(
    viaturas: { id: string; descricao: string; lat: number; lng: number }[]
  ) {
    const vistos = new Set<string>();

    for (const v of viaturas) {
      vistos.add(v.id);
      const existente = this.markers.get(v.id);
      if (existente) {
        existente.setLatLng([v.lat, v.lng]);
      } else {
        const m = L.marker([v.lat, v.lng])
          .bindPopup(v.descricao)
          .addTo(this.map);
        this.markers.set(v.id, m);
      }
    }

    // Remove marcadores de viaturas que não existem mais
    for (const [id, marker] of this.markers) {
      if (!vistos.has(id)) {
        marker.remove();
        this.markers.delete(id);
      }
    }
  }
}
