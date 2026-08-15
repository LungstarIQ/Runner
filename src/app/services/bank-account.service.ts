import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { BankAccountModel } from '../models/bank-account.model';

@Injectable({ providedIn: 'root' })
export class BankAccountService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/bank-accounts`;

  getById(id: string): Promise<BankAccountModel> {
    return firstValueFrom(this.http.get<BankAccountModel>(`${this.base}/${id}`));
  }

  deposit(id: string, amount: number): Promise<BankAccountModel> {
    const params = new HttpParams().set('amount', amount);
    return firstValueFrom(
      this.http.post<BankAccountModel>(`${this.base}/${id}/deposit`, null, { params }),
    );
  }

  // 400 if insufficient balance -- let the caller catch and surface that.
  withdraw(id: string, amount: number): Promise<BankAccountModel> {
    const params = new HttpParams().set('amount', amount);
    return firstValueFrom(
      this.http.post<BankAccountModel>(`${this.base}/${id}/withdraw`, null, { params }),
    );
  }
}