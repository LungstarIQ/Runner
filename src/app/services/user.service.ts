import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppUser } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/users`;

  // Mirrors the activeErrand pattern in ErrandService -- whichever
  // component fetches the signed-in user updates this signal, so the nav
  // avatar, dashboard stats, and profile screen can all read the same
  // value without each doing their own fetch.
  readonly currentUser = signal<AppUser | null>(null);

  // ASSUMPTION: this assumes GET /users/{id} exists on the backend,
  // mirroring the /errands/{id} pattern -- I haven't seen this endpoint
  // confirmed, so double check the route matches your UserController.
  async getById(userId: string): Promise<AppUser> {
    const user = await firstValueFrom(this.http.get<AppUser>(`${this.base}/${userId}`));
    this.currentUser.set(user);
    return user;
  }
}