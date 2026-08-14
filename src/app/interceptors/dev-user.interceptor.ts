import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DevUserService } from '../services/dev-user.service';
import { environment } from '../../environments/environment';

// Was authInterceptor (attached a Firebase ID token). Auth is deferred,
// so this attaches X-User-Id instead -- matches the backend's
// DevUserFilter exactly. Synchronous now (no token to await), which is
// most of why this got simpler than the version it replaced.
export const devUserInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const devUserService = inject(DevUserService);
  const cloned = req.clone({ setHeaders: { 'X-User-Id': devUserService.currentUserId() } });
  return next(cloned);
};