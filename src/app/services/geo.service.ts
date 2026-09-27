// services/geo.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GeoService {
  /** Distância Haversine em km */
  distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /** ETA aproximado em minutos — assume 30 km/h em área urbana */
  etaMinutos(distKm: number, velocidadeKmh = 30): number {
    return Math.round((distKm / velocidadeKmh) * 60);
  }
}
