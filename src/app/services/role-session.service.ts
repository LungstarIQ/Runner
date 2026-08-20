import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ActiveRole = 'customer' | 'runner';

const ROLE_KEY = 'runner_active_role';

// Deliberately sessionStorage, not localStorage. localStorage is shared
// across every tab/window on this origin -- that's exactly what
// DevSessionService wants for customerId/runnerId, since those are real
// backend records you want the same everywhere. sessionStorage is
// per-tab: open two windows, set one to "Customer" and the other to
// "Runner", and each keeps its own choice independently even though both
// are reading the same underlying customer/runner ids from localStorage.
@Injectable({ providedIn: 'root' })
export class RoleSessionService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly activeRole = signal<ActiveRole>(this.readStored());

  setRole(role: ActiveRole): void {
    this.activeRole.set(role);
    if (this.isBrowser) {
      sessionStorage.setItem(ROLE_KEY, role);
    }
  }

  private readStored(): ActiveRole {
    if (!this.isBrowser) return 'customer';
    return sessionStorage.getItem(ROLE_KEY) === 'runner' ? 'runner' : 'customer';
  }
}