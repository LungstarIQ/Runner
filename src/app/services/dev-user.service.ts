import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'runner_dev_user_id';
const DEFAULT_USER = 'test-poster-1';

// Stand-in for real auth while it's deferred (matches DevUserFilter on
// the backend). Whatever string is here gets sent as the X-User-Id
// header on every API call -- swap this for real Firebase auth later by
// setting currentUserId from the signed-in user's uid instead of a
// manually-typed string, nothing else in the app needs to change since
// everything else only ever reads currentUserId(), never how it got set.
@Injectable({ providedIn: 'root' })
export class DevUserService {
  // localStorage doesn't exist during SSR -- this app renders on the
  // server first, so any code path that touches it unconditionally
  // breaks the server render, not just the browser one.
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly currentUserId = signal<string>(
    this.isBrowser ? (localStorage.getItem(STORAGE_KEY) ?? DEFAULT_USER) : DEFAULT_USER,
  );

  setUser(id: string): void {
    this.currentUserId.set(id);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }
}