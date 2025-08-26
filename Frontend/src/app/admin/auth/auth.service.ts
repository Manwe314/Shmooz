import { HttpClient } from '@angular/common/http';
import { inject,Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, tap, timeout } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';
import { CsrfService } from './csrf.service';
import { TokenService } from './token.service';

interface TokenPair {
  access: string;
  refresh?: string;
}
interface AccessOnly {
  access: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokens = inject(TokenService);
  private api = inject(ApiService);
  private csrf = inject(CsrfService);

  private refreshing$?: Observable<string | null>;

  login(username: string, password: string): Observable<boolean> {
    return this.csrf.ensureCsrfCookie().pipe(
      switchMap(() =>
        this.http.post<TokenPair>(
          this.api.buildUrl('token/'),
          { username, password },
          { withCredentials: true },
        ),
      ),
      tap((res) => this.tokens.setAccessToken(res.access)),
      map(() => true),
      catchError((err) => {
        console.error('Login failed', err);
        this.tokens.clear();
        return of(false);
      }),
    );
  }

  refreshAccess(): Observable<string | null> {
    if (this.refreshing$) return this.refreshing$;

    this.refreshing$ = this.csrf.ensureCsrfCookie().pipe(
      switchMap(
        () =>
          this.http
            .post<AccessOnly>(this.api.buildUrl('token/refresh/'), {}, { withCredentials: true })
            .pipe(timeout(5000)),
      ),
      tap((resp) => this.tokens.setAccessToken(resp.access)),
      map((resp) => resp.access),
      catchError((err) => {
        console.warn('Refresh failed', err);
        this.tokens.clear();
        return of(null);
      }),
      finalize(() => {
        this.refreshing$ = undefined;
      }),
      shareReplay(1),
    );

    return this.refreshing$;
  }

  ensureSession(): Observable<boolean> {
    if (this.tokens.hasAccessToken() && !this.tokens.isExpiringSoon(20)) {
      return of(true);
    }
    return this.refreshAccess().pipe(map((tok) => !!tok));
  }

  isLoggedIn(): boolean {
    return this.tokens.hasAccessToken() && !this.tokens.isExpired(10);
  }

  logout(): void {
    this.http
      .post(this.api.buildUrl('logout/'), {}, { withCredentials: true })
      .subscribe({ next: () => {}, error: () => {} });
    this.tokens.clear();
    this.router.navigate(['/login']);
  }
}
