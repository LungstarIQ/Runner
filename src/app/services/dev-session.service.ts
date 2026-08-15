import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const CUSTOMER_KEY = 'runner_dev_customer_id';
const RUNNER_KEY = 'runner_dev_runner_id';

// Replaces DevUserService entirely. The v4 backend has no auth filter of
// any kind, so there's nothing to inject as a header anymore -- this just
// remembers whichever Customer/Runner ids you created via the dev setup
// screen. Components read these signals directly and pass them explicitly
// as query params wherever the backend needs one (POST
// /errands?customerId=..., POST /errands/{id}/claim?runnerId=...). Nothing
// here sends anything automatically -- there is no interceptor.
@Injectable({ providedIn: 'root' })
export class DevSessionService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly customerId = signal<string | null>(this.readStored(CUSTOMER_KEY));
  readonly runnerId = signal<string | null>(this.readStored(RUNNER_KEY));

  setCustomerId(id: string): void {
    this.customerId.set(id);
    this.writeStored(CUSTOMER_KEY, id);
  }

  setRunnerId(id: string): void {
    this.runnerId.set(id);
    this.writeStored(RUNNER_KEY, id);
  }

  private readStored(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  private writeStored(key: string, value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(key, value);
    }
  }
}