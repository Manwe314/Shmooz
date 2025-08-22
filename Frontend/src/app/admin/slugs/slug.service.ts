import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { ApiService } from '../../services/api.service';

export interface SlugEntry {
  id: number;
  slug: string;
  created_at: string;
  edited_at: string;
}

@Injectable({ providedIn: 'root' })
export class SlugService {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  private slugsSubject = new BehaviorSubject<SlugEntry[]>([]);
  slugs$ = this.slugsSubject.asObservable();

  private selectedSlugSubject = new BehaviorSubject<SlugEntry | null>(null);
  selectedSlug$ = this.selectedSlugSubject.asObservable();

  /** Snapshot helpers for guards/quick checks */
  get slugsSnapshot(): SlugEntry[] { return this.slugsSubject.value; }
  get selectedSlugSnapshot(): SlugEntry | null { return this.selectedSlugSubject.value; }

  loadSlugs(): Observable<SlugEntry[]> {
    return this.http.get<SlugEntry[]>(this.api.buildUrl('slugs/'))
      .pipe(tap(list => this.slugsSubject.next(list)));
  }

  selectSlug(entry: SlugEntry | null) {
    this.selectedSlugSubject.next(entry);
  }

  createSlug(slug: string): Observable<SlugEntry | null> {
    return this.http.post<SlugEntry>(this.api.buildUrl('auth/create_slug/'), { slug })
      .pipe(
        tap(created => this.slugsSubject.next([created, ...this.slugsSnapshot])),
        catchError(err => {
          console.error('Create slug failed', err);
          return of(null);
        })
      );
  }

  updateSlug(id: number, newSlug: string): Observable<SlugEntry | null> {
    return this.http.put<SlugEntry>(this.api.buildUrl(`auth/alter_slug/${id}`), { slug: newSlug })
      .pipe(
        tap(updated => {
          const list = this.slugsSnapshot.map(s => s.id === id ? updated : s);
          this.slugsSubject.next(list);
          if (this.selectedSlugSnapshot?.id === id) this.selectSlug(updated);
        }),
        catchError(err => {
          console.error('Update slug failed', err);
          return of(null);
        })
      );
  }

  deleteSlug(id: number): Observable<boolean> {
    return this.http.delete(this.api.buildUrl(`auth/alter_slug/${id}`))
      .pipe(
        tap(() => {
          const list = this.slugsSnapshot.filter(s => s.id !== id);
          this.slugsSubject.next(list);
          if (this.selectedSlugSnapshot?.id === id) this.selectSlug(null);
        }),
        map(() => true),
        catchError(err => {
          console.error('Delete slug failed', err);
          return of(false);
        })
      );
  }
}
