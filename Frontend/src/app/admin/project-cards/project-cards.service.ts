import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject,Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';

export interface ProjectCardDto {
  id: number;
  title: string;
  text: string;
  text_color: string;
  label_letter: string;
  label_color: string;
  inline_color: string;
  owner: string;
  image: number | null;
  image_url: string | null;
  deck: number | null;
  created_at: string;
  edited_at: string | null;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class ProjectCardsService {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  listByOwnerAndDeck(ownerSlug: string, deckId: number, limit = 100): Observable<ProjectCardDto[]> {
    const url = this.api.buildUrl(
      `projects/${encodeURIComponent(ownerSlug)}?ordering=-edited_at&limit=${limit}`,
    );
    const headers = new HttpHeaders({ 'X-deck-id': String(deckId) });
    return this.http.get<Page<ProjectCardDto>>(url, { headers }).pipe(
      map((p) => p.results || []),
      catchError((err) => {
        console.error('Failed to fetch project cards', err);
        return of([]);
      }),
    );
  }

  create(
    ownerSlug: string,
    body: {
      title: string;
      text: string;
      text_color: string;
      label_letter: string;
      label_color: string;
      inline_color: string;
      owner: string;
      deck_id: number;
      image_id?: number;
    },
  ): Observable<ProjectCardDto | null> {
    const url = this.api.buildUrl(`auth/create_project_card/${encodeURIComponent(ownerSlug)}`);
    return this.http.post<ProjectCardDto>(url, body).pipe(
      catchError((err) => {
        console.error('Create project card failed', err);
        return of(null);
      }),
    );
  }

  update(
    id: number,
    ownerSlug: string,
    deckId: number,
    patch: Partial<
      Omit<ProjectCardDto, 'id' | 'deck' | 'image' | 'created_at' | 'edited_at' | 'owner'>
    > & { image_id?: number },
  ): Observable<ProjectCardDto | null> {
    const url = this.api.buildUrl(`auth/alter_project_card/${id}`);
    const body: any = { ...patch, owner: ownerSlug, deck_id: deckId };
    return this.http.put<ProjectCardDto>(url, body).pipe(
      catchError((err) => {
        console.error('Update project card failed', err);
        return of(null);
      }),
    );
  }

  delete(id: number): Observable<boolean> {
    const url = this.api.buildUrl(`auth/alter_project_card/${id}`);
    return this.http.delete(url).pipe(
      map(() => true),
      catchError((err) => {
        console.error('Delete project card failed', err);
        return of(false);
      }),
    );
  }
}
