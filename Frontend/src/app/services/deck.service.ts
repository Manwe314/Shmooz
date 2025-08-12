import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';

interface PaginatedResponse<T> {
  results: T[];
}

export interface Deck {
  id: string;
  title: string;
  displayed_name: string;
  owner: string;
  image_url: string;
  image: string;
  hover_img_url?: string;
  card_amount?: number;
  x_offsets?: number[];
  y_offsets?: number[];
  rotations?: number[];
  alphas?: number[];
  brightness?: number[];
  hover_x_offsets?: number[];
  hover_y_offsets?: number[];
  hover_rotations?: number[];
  hover_brightness?: number[];
}

@Injectable({
  providedIn: 'root' 
})
export class DeckService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private decks: Deck[] | null = null;

  setResolvedDecks(data: Deck[]) {
    this.decks = data;
  }
  
  getResolvedDeck(): Deck[] {
    return this.decks ?? [];
  }

  getDecks(path: string): Observable<Deck[]> {
    const endpoint = path ? this.api.buildUrl(`deck/${path}`) : this.api.buildUrl(`deck/shmooz`);
    return this.http.get<PaginatedResponse<Deck>>(endpoint).pipe(
      map((res: PaginatedResponse<Deck>) => res?.results ?? [])
    );
  }
}