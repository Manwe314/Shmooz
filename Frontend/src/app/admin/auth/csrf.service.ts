import { HttpClient } from '@angular/common/http';
import { inject,Injectable } from '@angular/core';
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
    return document.cookie.split(';').some((c) => c.trim().startsWith(`${name}=`));
  }

  ensureCsrfCookie(): Observable<boolean> {
    if (this.hasCookie()) return of(true);

    if (!this.inflight$) {
      this.inflight$ = this.http
        .get(
          this.api.buildUrl('auth/csrf/'),
          { withCredentials: true },
        )
        .pipe(
          map(() => true),
          catchError(() => of(false)),
          finalize(() => {
            this.inflight$ = undefined;
          }),
          shareReplay(1),
        );
    }
    return this.inflight$;
  }
}
