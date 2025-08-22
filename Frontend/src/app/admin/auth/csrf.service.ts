import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';

@Injectable({ providedIn: 'root' })
export class CsrfService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private inflight$?: Observable<boolean>;

  private hasCookie(name = 'csrftoken'): boolean {
    if (typeof document === 'undefined') return false;
    return document.cookie.split(';').some(c => c.trim().startsWith(`${name}=`));
    // If you want stronger guarantees, you can always hit the endpoint.
  }

  /** Ensure CSRFTOKEN cookie exists by calling /api/auth/csrf/ once. */
  ensureCsrfCookie(): Observable<boolean> {
    if (this.hasCookie()) return of(true);

    if (!this.inflight$) {
      this.inflight$ = this.http.get(
        this.api.buildUrl('auth/csrf/'),
        { withCredentials: true }               // accept Set-Cookie
      ).pipe(
        map(() => true),
        catchError(() => of(false)),
        finalize(() => { this.inflight$ = undefined; }),
        shareReplay(1)
      );
    }
    return this.inflight$;
  }
}
