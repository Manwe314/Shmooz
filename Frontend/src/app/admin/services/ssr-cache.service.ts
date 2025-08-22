import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * IMPORTANT:
 * - For dev use only, or proxy this via your backend so you don't expose the admin key client-side.
 */
@Injectable({ providedIn: 'root' })
export class SsrCacheService {
  private http = inject(HttpClient);

  private adminKey = (globalThis as any)?.env?.ADMIN_CACHE_KEY || ''; // OR inject via environment.ts

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'x-admin-key': this.adminKey });
  }

  invalidateDeck(slug: string): Observable<any> {
    return this.http.post('/__admin/ssr-cache/invalidate', { kind: 'deck', slug }, { headers: this.headers() });
  }

  invalidateBackground(slug: string): Observable<any> {
    return this.http.post('/__admin/ssr-cache/invalidate', { kind: 'background', slug }, { headers: this.headers() });
  }

  invalidatePage(category: 'page_one'|'page_two', slug: string): Observable<any> {
    return this.http.post('/__admin/ssr-cache/invalidate', { kind: 'page', category, slug }, { headers: this.headers() });
  }

  invalidateProjectPage(id: number, slug?: string): Observable<any> {
    return this.http.post('/__admin/ssr-cache/invalidate', { kind: 'project_page', id, slug }, { headers: this.headers() });
  }
}
