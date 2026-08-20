import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DevSessionService } from '../../services/dev-session.service';
import { RoleSessionService, ActiveRole } from '../../services/role-session.service';
import { ToastStack } from '../toast-stack/toast-stack';

// Wraps every routed page -- sidebar + topbar on desktop, a bottom tab bar
// on mobile, both from the original mockups. Individual page components
// (HomeDashboardComponent, BrowseErrandsComponent, etc.) only ever render
// their own content area; this is what puts that content inside the app
// chrome. Wire it up as the top-level component in your routes, with every
// other route as a child so <router-outlet> below renders them.

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ToastStack],
  templateUrl: './tab.html',
  styleUrl: './tab.scss',
})
export class Tab {
  private readonly devSession = inject(DevSessionService);
  private readonly roleSession = inject(RoleSessionService);
 
  readonly customerId = this.devSession.customerId;
  readonly runnerId = this.devSession.runnerId;
  readonly activeRole = this.roleSession.activeRole;
 
  setRole(role: ActiveRole): void {
    this.roleSession.setRole(role);
  }
}
