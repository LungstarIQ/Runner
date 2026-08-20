import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ErrandModel, CreateErrandRequest, ErrandEvent } from '../models/errand.model';
import { TransactionModel } from '../models/transaction.model';
import { ReviewModel, CreateReviewRequest } from '../models/review.model';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ErrandService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly base = `${environment.apiBaseUrl}/errands`;

  // Tracker + any other component that touches an errand read from this
  // one signal, so a claim/transition/refund updates everywhere at once.
  readonly activeErrand = signal<ErrandModel | null>(null);

  // NOTE: the backend doc lists no GET /errands (feed/list) endpoint --
  // only GET /errands/{id}. The old getFeed() called something that
  // doesn't exist here, so it's gone rather than pointed at a 404. See the
  // chat message for what this means for BrowseErrandsComponent.

  async getById(errandId: string): Promise<ErrandModel> {
    const errand = await firstValueFrom(this.http.get<ErrandModel>(`${this.base}/${errandId}`));
    this.activeErrand.set(errand);
    return errand;
  }

  // customerId is a query param, not part of the body.
  async create(customerId: string, request: CreateErrandRequest): Promise<ErrandModel> {
    const params = new HttpParams().set('customerId', customerId);
    const errand = await firstValueFrom(
      this.http.post<ErrandModel>(this.base, request, { params }),
    );
    this.activeErrand.set(errand);
    this.notificationService.notify({
      kind: 'info',
      title: 'New errand nearby',
      body: errand.description,
      targetRole: 'runner',
    });
    return errand;
  }

  async claim(errandId: string, runnerId: string): Promise<ErrandModel> {
    const params = new HttpParams().set('runnerId', runnerId);
    const errand = await firstValueFrom(
      this.http.post<ErrandModel>(`${this.base}/${errandId}/claim`, null, { params }),
    );
    this.activeErrand.set(errand);
    this.notificationService.notify({
      kind: 'success',
      title: 'Your errand was accepted!',
      body: `${errand.description} — a runner is on it`,
      targetRole: 'customer',
      targetCustomerId: errand.customerId,
    });
    return errand;
  }

  // event is a query param, no body -- the main contract change from the
  // old version, which POSTed { event } as JSON.
  async transition(errandId: string, event: ErrandEvent): Promise<ErrandModel> {
    const params = new HttpParams().set('event', event);
    const errand = await firstValueFrom(
      this.http.post<ErrandModel>(`${this.base}/${errandId}/status`, null, { params }),
    );
    this.activeErrand.set(errand);
    return errand;
  }

  // Only valid when status is COMPLETED. Status stays COMPLETED afterwards
  // -- check getTransactions() for a REFUND entry to know it happened,
  // don't expect the status itself to change.
  async refund(errandId: string): Promise<ErrandModel> {
    const errand = await firstValueFrom(
      this.http.post<ErrandModel>(`${this.base}/${errandId}/refund`, null),
    );
    this.activeErrand.set(errand);
    return errand;
  }

  getTransactions(errandId: string): Promise<TransactionModel[]> {
    return firstValueFrom(
      this.http.get<TransactionModel[]>(`${this.base}/${errandId}/transactions`),
    );
  }

  // Only allowed once the errand is COMPLETED.
  submitReview(errandId: string, request: CreateReviewRequest): Promise<ReviewModel> {
    return firstValueFrom(this.http.post<ReviewModel>(`${this.base}/${errandId}/review`, request));
  }

  // The response to the final INITIATE_PAYMENT call returns
  // PROCESSING_PAYMENT, not the eventual COMPLETED/DISPUTED/PAYMENT_FAILED
  // -- that happens moments later on a background thread. Call this right
  // after that transition() to poll until it settles, and use the
  // returned errand's status to decide what the tracker shows next.
  async pollUntilSettled(
    errandId: string,
    { intervalMs = 1000, maxAttempts = 10 }: { intervalMs?: number; maxAttempts?: number } = {},
  ): Promise<ErrandModel> {
    let errand = await this.getById(errandId);
    let attempts = 0;
    while (errand.status === 'PROCESSING_PAYMENT' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      errand = await this.getById(errandId);
      attempts++;
    }
    return errand;
  }
}