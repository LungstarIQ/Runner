import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { RunnerModel, CreateRunnerRequest } from '../models/runner.model';

@Injectable({ providedIn: 'root' })
export class RunnerService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/runners`;

  create(request: CreateRunnerRequest): Promise<RunnerModel> {
    return firstValueFrom(this.http.post<RunnerModel>(this.base, request));
  }

  getById(id: string): Promise<RunnerModel> {
    return firstValueFrom(this.http.get<RunnerModel>(`${this.base}/${id}`));
  }

  // Partial update -- only non-null fields you send are applied.
  update(id: string, request: Partial<CreateRunnerRequest>): Promise<RunnerModel> {
    return firstValueFrom(this.http.put<RunnerModel>(`${this.base}/${id}`, request));
  }
}