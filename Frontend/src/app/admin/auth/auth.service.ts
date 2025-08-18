import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { ApiService } from '../../services/api.service';
import { Observable, ReplaySubject, of } from 'rxjs';
import { tap, map, catchError, finalize, shareReplay } from 'rxjs/operators';

interface TokenPair { access: string; refresh?: string; }
interface AccessOnly { access: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokens = inject(TokenService);
  private api = inject(ApiService);

  private refreshing = false;
  private refresh$ = new ReplaySubject<string | null>(1);

  login(username: string, password: string): Observable<boolean> {
    // Backend sets HttpOnly refresh cookie; we just read access from body
    return this.http.post<TokenPair>(this.api.buildUrl('token/'), { username, password }, { withCredentials: true }).pipe(
      tap(res => this.tokens.setAccessToken(res.access)),
      map(() => true),
      catchError(err => {
        console.error('Login failed', err);
        this.tokens.clear();
        return of(false);
      })
    );
  }

  refreshAccess(): Observable<string | null> {
    if (this.refreshing) return this.refresh$.asObservable();

    this.refreshing = true;
    const req$ = this.http.post<AccessOnly>(this.api.buildUrl('token/refresh/'), {}, { withCredentials: true }).pipe(
      tap(res => this.tokens.setAccessToken(res.access)),
      tap(res => this.refresh$.next(res.access)),
      map(res => res.access),
      catchError(err => {
        console.warn('Refresh failed', err);
        this.tokens.clear();
        this.refresh$.next(null);
        this.router.navigate(['/login']);
        return of(null);
      }),
      finalize(() => this.refreshing = false),
      shareReplay(1)
    );

    return req$;
  }

  logout() {
    // (Optional) Tell backend to delete cookie
    this.http.post(this.api.buildUrl('logout/'), {}, { withCredentials: true }).subscribe({
      next: () => {},
      error: () => {}
    });
    this.tokens.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn() { return !this.tokens.isExpired(); }
}
