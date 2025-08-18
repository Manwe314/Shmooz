import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { tap, map } from 'rxjs/operators';

interface PaginatedResponse<T> {
  results: T[];
}

export interface ProjectCard {
  id: string;
  title: string;
  text: string;
  text_color: string;
  label_letter: string;
  label_color: string;
  inline_color: string;
  image_url: string;
  owner: string;
  animationState?: 'entering' | 'inHand' | 'discarding';
  offsetX?: number;
  offsetY?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectCardsService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private cache = new Map<string, ProjectCard[]>();

   getCardsForDeck(path: string, deck_id: string): Observable<ProjectCard[]> {
    const cacheKey = `${path}::${deck_id}`;
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }
  
    const url = path ? this.api.buildUrl(`projects/${path}`) : this.api.buildUrl(`projects/shmooz`);
    const headers = new HttpHeaders({ 'X-deck-id': deck_id });
  
    return this.http.get<PaginatedResponse<ProjectCard>>(url, { headers }).pipe(
      map((res: PaginatedResponse<ProjectCard>) => res?.results ?? []),
      tap((cards: ProjectCard[]) => this.cache.set(cacheKey, cards))
    );
  }

  clearCache(): void {
    this.cache.clear();
  }

}
