import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RoleSessionService, ActiveRole } from './role-session.service';
import { DevSessionService } from './dev-session.service';

export interface AppNotification {
  id: string;
  kind: 'info' | 'success';
  title: string;
  body: string;
  // Which role should see this -- 'runner' for "new errand nearby", etc.
  targetRole: ActiveRole;
  // Optional narrowing beyond role: only show to the window whose
  // DevSessionService id matches. Omit for a broadcast to every window
  // currently viewing as targetRole (e.g. "new errand nearby" -> every
  // runner-mode window, not just one runner).
  targetCustomerId?: string;
  targetRunnerId?: string;
}

type NotifyInput = Omit<AppNotification, 'id'>;

const CHANNEL_NAME = 'runner-notifications';
const AUTO_DISMISS_MS = 6000;

// Simulates push notifications across browser windows/tabs without any
// backend involved -- there's no websocket/push endpoint on the v4
// backend, and everything here is local-testing-only anyway.
// BroadcastChannel delivers a message to every OTHER same-origin
// tab/window and never back to the sender -- exactly the shape needed: a
// runner claiming an errand in one window shows a toast in a *different*
// window (the customer's), not in the window that triggered the action.
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly roleSession = inject(RoleSessionService);
  private readonly devSession = inject(DevSessionService);

  private channel: BroadcastChannel | null = null;

  readonly incoming = signal<AppNotification[]>([]);

  constructor() {
    if (this.isBrowser && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<AppNotification>) => {
        this.handleIncoming(event.data);
      };
    }
  }

  notify(input: NotifyInput): void {
    if (!this.channel) return; // SSR, or a browser without BroadcastChannel
    this.channel.postMessage({ ...input, id: crypto.randomUUID() } satisfies AppNotification);
  }

  dismiss(id: string): void {
    this.incoming.update((list) => list.filter((n) => n.id !== id));
  }

  private handleIncoming(notification: AppNotification): void {
    if (notification.targetRole !== this.roleSession.activeRole()) return;
    if (notification.targetCustomerId && notification.targetCustomerId !== this.devSession.customerId()) {
      return;
    }
    if (notification.targetRunnerId && notification.targetRunnerId !== this.devSession.runnerId()) {
      return;
    }

    this.incoming.update((list) => [...list, notification]);
    setTimeout(() => this.dismiss(notification.id), AUTO_DISMISS_MS);
  }
}