import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Errand, CreateErrandRequest, ErrandCategory, ErrandEvent } from '../models/errand.model';

interface FeedQuery {
  lat: number;
  lng: number;
  category?: ErrandCategory;
  radiusKm?: number;
}

@Injectable({ providedIn: 'root' })
export class ErrandService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/errands`;

  // Feed cards + the active ticket both read from this signal so the
  // tracker screen updates the moment a status change comes back,
  // without a manual refetch.
  readonly activeErrand = signal<Errand | null>(null);

  async getFeed(query: FeedQuery): Promise<Errand[]> {
    let params = new HttpParams()
      .set('lat', query.lat)
      .set('lng', query.lng)
      .set('radiusKm', query.radiusKm ?? 10);
    if (query.category) {
      params = params.set('category', query.category);
    }
    return firstValueFrom(this.http.get<Errand[]>(this.base, { params }));
  }

  async getById(errandId: string | number): Promise<Errand> {
    const errand = await firstValueFrom(this.http.get<Errand>(`${this.base}/${errandId}`));
    this.activeErrand.set(errand);
    return errand;
  }

  async create(request: CreateErrandRequest): Promise<Errand> {
    return firstValueFrom(this.http.post<Errand>(`${this.base}`, request));
  }

  async claim(errandId: string | number): Promise<Errand> {
    const errand = await firstValueFrom(
      this.http.post<Errand>(`${this.base}/${errandId}/claim`, {})
    );
    this.activeErrand.set(errand);
    return errand;
  }

  // Takes an Event, not a target ErrandStatus -- a target state alone is
  // ambiguous once a state has more than one way out (EN_ROUTE can go to
  // DELIVERED via DELIVER, or DISPUTED via RAISE_DISPUTE). The backend
  // only accepts { event: "..." }, so this does too.
  async transition(errandId: string | number, event: ErrandEvent): Promise<Errand> {
    const errand = await firstValueFrom(
      this.http.post<Errand>(`${this.base}/${errandId}/status`, { event })
    );
    this.activeErrand.set(errand);
    return errand;
  }

  async listRunnersNearby(lat: number, lng: number, radiusKm = 10) {
    const params = new HttpParams().set('lat', lat).set('lng', lng).set('radiusKm', radiusKm);
    return firstValueFrom(this.http.get<any[]>(`${environment.apiBaseUrl}/runners`, { params }));
  }
}
