import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface DeckDto {
  id: number;
  title: string;
  displayed_name: string;
  owner: string;

  image: number | null;
  image_url: string | null;

  hover_img: number | null;
  hover_img_url: string | null;

  card_amount: number | null;

  x_offsets: number[];
  y_offsets: number[];
  rotations: number[];
  alphas: number[];
  brightness: number[];

  hover_x_offsets: number[];
  hover_y_offsets: number[];
  hover_rotations: number[];
  hover_brightness: number[];

  created_at: string;
  edited_at: string | null;

  text_color: string | null;
  hover_color: string | null;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class DeckService {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  listByOwner(ownerSlug: string, limit = 100): Observable<DeckDto[]> {
    const url = this.api.buildUrl(`deck/${encodeURIComponent(ownerSlug)}?ordering=-edited_at&limit=${limit}`);
    return this.http.get<Page<DeckDto>>(url).pipe(
      map(p => p.results || []),
      catchError(err => {
        console.error('Failed to fetch decks', err);
        return of([]);
      })
    );
  }

  createDeck(
    ownerSlug: string,
    body: Partial<DeckDto> & { title: string; displayed_name: string; image_id?: number; hover_img_id?: number; owner: string }
  ): Observable<DeckDto | null> {
    const url = this.api.buildUrl(`auth/create_deck/${encodeURIComponent(ownerSlug)}`);
    return this.http.post<DeckDto>(url, body).pipe(
      catchError(err => { console.error('Create deck failed', err); return of(null); })
    );
  }

  updateDeck(
    id: number,
    ownerSlug: string,
    patch: Omit<Partial<DeckDto>, 'owner'>
  ): Observable<DeckDto | null> {
    const url = this.api.buildUrl(`auth/alter_deck/${id}`);
    const body = { ...patch, owner: ownerSlug };
    return this.http.put<DeckDto>(url, body).pipe(
      catchError(err => { console.error('Update deck failed', err); return of(null); })
    );
  }

  deleteDeck(id: number): Observable<boolean> {
    const url = this.api.buildUrl(`auth/alter_deck/${id}`);
    return this.http.delete(url).pipe(
      map(() => true),
      catchError(err => { console.error('Delete deck failed', err); return of(false); })
    );
  }
}
