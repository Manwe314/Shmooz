import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { catchError, switchMap, throwError, of } from 'rxjs';

function isAuthUrl(req: HttpRequest<unknown>): boolean {
  const url = req.url;
  return url.endsWith('/api/token/') || url.endsWith('/api/token/refresh/') || url.endsWith('/api/logout/');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const tokens = inject(TokenService);

  // Always include cookies (for refresh cookie + CSRF)
  let request = req.clone({ withCredentials: true });

  const attach = (r: HttpRequest<unknown>, token: string | null) =>
    token ? r.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : r;

  const handle = (r: HttpRequest<unknown>) =>
    next(r).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !isAuthUrl(r)) {
          return auth.refreshAccess().pipe(
            switchMap(newToken => {
              if (!newToken) return throwError(() => err);
              return next(attach(r, newToken));
            })
          );
        }
        return throwError(() => err);
      })
    );

  if (!isAuthUrl(request)) {
    // Proactive refresh if token missing/expiring
    const token = tokens.getAccessToken();
    if (!token || tokens.isExpiringSoon(20)) {
      return auth.refreshAccess().pipe(
        switchMap(newToken => handle(attach(request, newToken)))
      );
    }
    request = attach(request, token);
  }

  return handle(request);
};
