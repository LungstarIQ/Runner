import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { CustomerModel, CreateCustomerRequest } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/customers`;

  create(request: CreateCustomerRequest): Promise<CustomerModel> {
    return firstValueFrom(this.http.post<CustomerModel>(this.base, request));
  }

  getById(id: string): Promise<CustomerModel> {
    return firstValueFrom(this.http.get<CustomerModel>(`${this.base}/${id}`));
  }

  // Partial update -- only non-null fields you send are applied.
  update(id: string, request: Partial<CreateCustomerRequest>): Promise<CustomerModel> {
    return firstValueFrom(this.http.put<CustomerModel>(`${this.base}/${id}`, request));
  }
}