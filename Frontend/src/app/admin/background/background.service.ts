import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { Observable, of, forkJoin, map, catchError } from 'rxjs';

export interface BackgroundData {
  id: number;
  color1: string; color2: string; color3: string;
  position1: string; position2: string; position3: string;
  page1: string; page2: string;
  navColor: string; arrowColor: string;
  ellipseWidth: number; ellipseHeight: number;
  created_at: string; edited_at: string | null;
}

// ---- API-shape types ----
interface GradientResp {
  id: number;
  color1: string;
  color2: string;
  color3: string;
  position1: string;
  position2: string;
  position3: string;
  created_at: string;
  edited_at: string | null;
}
interface DetailsResp {
  id: number;
  navColor: string;
  arrowColor: string;
  ellipseWidth: number;
  ellipseHeight: number;
  created_at: string;
  edited_at: string | null;
}
interface NamesResp {
  id: number;
  page1: string;
  page2: string;
  created_at: string;
  edited_at: string | null;
}

// For create we include owner (assumption: backend accepts it or derives it)
export type BackgroundCreate = {
  owner: string;
  color1: string; color2: string; color3: string;
  position1: string; position2: string; position3: string;
  page1: string; page2: string;
  navColor: string; arrowColor: string;
  ellipseWidth: number; ellipseHeight: number;
};

export type BackgroundUpdate = Partial<Omit<BackgroundData, 'id' | 'created_at' | 'edited_at'>>;

@Injectable({ providedIn: 'root' })
export class BackgroundService {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  private GRADIENT_URL = (slug: string) => `gradient-colors/${encodeURIComponent(slug)}`;
  private DETAILS_URL  = (slug: string) => `page-details/${encodeURIComponent(slug)}`;
  private NAMES_URL    = (slug: string) => `page-names/${encodeURIComponent(slug)}`;

  private CREATE_URL = 'auth/create_background/';
  private ALTER_URL  = (id: number) => `auth/alter_background/${id}`;

  getByOwner(ownerSlug: string): Observable<BackgroundData | null> {
    const gradient$ = this.http.get<any>(this.api.buildUrl(this.GRADIENT_URL(ownerSlug))).pipe(catchError(() => of(null)));
    const details$  = this.http.get<any>(this.api.buildUrl(this.DETAILS_URL(ownerSlug))).pipe(catchError(() => of(null)));
    const names$    = this.http.get<any>(this.api.buildUrl(this.NAMES_URL(ownerSlug))).pipe(catchError(() => of(null)));

    return forkJoin([gradient$, details$, names$]).pipe(
      map(([g, d, n]) => {
        if (!g && !d && !n) return null;
        const id = g?.id ?? d?.id ?? n?.id ?? 0;
        const created_at = g?.created_at ?? d?.created_at ?? n?.created_at ?? '';
        const edited_at  = g?.edited_at  ?? d?.edited_at  ?? n?.edited_at  ?? null;
        return {
          id,
          color1: g?.color1 ?? '', color2: g?.color2 ?? '', color3: g?.color3 ?? '',
          position1: g?.position1 ?? '', position2: g?.position2 ?? '', position3: g?.position3 ?? '',
          page1: n?.page1 ?? '', page2: n?.page2 ?? '',
          navColor: d?.navColor ?? '#000000', arrowColor: d?.arrowColor ?? '#FFFFFF',
          ellipseWidth: d?.ellipseWidth ?? 0, ellipseHeight: d?.ellipseHeight ?? 0,
          created_at, edited_at,
        } as BackgroundData;
      })
    );
  }

  /** Always include owner on CREATE */
  createBackground(owner: string, values: Omit<BackgroundData, 'id'|'created_at'|'edited_at'>): Observable<BackgroundData | null> {
    const body = { owner, ...values };
    return this.http.post<BackgroundData>(this.api.buildUrl(this.CREATE_URL), body)
      .pipe(catchError(err => { console.error('Create background failed', err); return of(null); }));
  }

  /** Always include owner on UPDATE */
  updateBackground(id: number, owner: string, patch: Partial<Omit<BackgroundData, 'id'|'created_at'|'edited_at'>>): Observable<BackgroundData | null> {
    const body = { owner, ...patch };
    return this.http.put<BackgroundData>(this.api.buildUrl(this.ALTER_URL(id)), body)
      .pipe(catchError(err => { console.error('Update background failed', err); return of(null); }));
  }

  deleteBackground(id: number): Observable<boolean> {
    return this.http.delete(this.api.buildUrl(this.ALTER_URL(id)))
      .pipe(map(() => true), catchError(err => { console.error('Delete background failed', err); return of(false); }));
  }
}
