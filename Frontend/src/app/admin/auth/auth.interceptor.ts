// src/app/admin/auth/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';
import { Subject } from 'rxjs';

const refreshGate = {
  inFlight: false,
  subject: new Subject<string | null>(),
};

function isAuthEndpoint(url: string): boolean {
  // Make sure these match your ApiService.buildUrl outputs
  // and cover token + csrf endpoints.
  return url.includes('/token/') || url.includes('/auth/csrf');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokens = inject(TokenService);
  const auth = inject(AuthService);

  const skip = isAuthEndpoint(req.url);

  // Attach Authorization if we have a token and request is not auth-related
  const access = tokens.getAccessToken();
  const authedReq = access && !skip
    ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } })
    : req;

  return next(authedReq).pipe(
    catchError((err) => {
      const httpErr = err as HttpErrorResponse;

      // Only try refresh for 401s on non-auth endpoints
      if (httpErr.status === 401 && !skip) {
        // If a refresh is already in flight, wait for it
        if (refreshGate.inFlight) {
          return refreshGate.subject.pipe(
            filter(v => v !== undefined),
            take(1),
            switchMap((token) => {
              if (!token) return throwError(() => httpErr);
              const retry = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
              return next(retry);
            })
          );
        }

        // Start a single refresh
        refreshGate.inFlight = true;
        return auth.refreshAccess().pipe(
          take(1),
          switchMap((token) => {
            refreshGate.subject.next(token);
            if (!token) return throwError(() => httpErr);
            const retry = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
            return next(retry);
          }),
          finalize(() => {
            refreshGate.inFlight = false;
          })
        );
      }

      return throwError(() => httpErr);
    })
  );
};
