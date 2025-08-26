import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject,Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SsrCacheService {
  private http = inject(HttpClient);

  private adminKey = (globalThis as any)?.env?.ADMIN_CACHE_KEY || '';

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'x-admin-key': this.adminKey });
  }

  invalidateDeck(slug: string): Observable<any> {
    return this.http.post(
      '/__admin/ssr-cache/invalidate',
      { kind: 'deck', slug },
      { headers: this.headers() },
    );
  }

  invalidateBackground(slug: string): Observable<any> {
    return this.http.post(
      '/__admin/ssr-cache/invalidate',
      { kind: 'background', slug },
      { headers: this.headers() },
    );
  }

  invalidatePage(category: 'page_one' | 'page_two', slug: string): Observable<any> {
    return this.http.post(
      '/__admin/ssr-cache/invalidate',
      { kind: 'page', category, slug },
      { headers: this.headers() },
    );
  }

  invalidateProjectPage(id: number, slug?: string): Observable<any> {
    return this.http.post(
      '/__admin/ssr-cache/invalidate',
      { kind: 'project_page', id, slug },
      { headers: this.headers() },
    );
  }
}
