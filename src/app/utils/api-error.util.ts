import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-error.model';

// Every error response from the v4 backend is a flat { error: string } --
// no field-level detail, per the backend doc. This pulls that message out
// of a failed HttpClient call so components can show the real reason
// (insufficient balance, invalid FSM transition, missing required field,
// etc.) instead of a generic fallback. Falls back to `fallback` only when
// the response isn't shaped as expected -- network failure, backend
// unreachable, or an error format that doesn't match ApiError.
export function extractApiError(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as ApiError | undefined;
    if (body && typeof body.error === 'string' && body.error.trim()) {
      return body.error;
    }
  }
  return fallback;
}