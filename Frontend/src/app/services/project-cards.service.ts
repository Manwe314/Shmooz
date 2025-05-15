import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';



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
}

@Injectable({
  providedIn: 'root'
})
export class ProjectCardsService {
  private http = inject(HttpClient);
  private cache = new Map<string, ProjectCard[]>();

  getCardsForDeck(path: string, deck_id: string): Observable<ProjectCard[]> {
    const cacheKey = `${path}::${deck_id}`;
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    const url = path ?  `https://127.0.0.1:443/api/projects/${path}` : `https://127.0.0.1:443/api/projects/` ;
    const headers = new HttpHeaders({
      'X-deck-id': deck_id
    });

    console.log('url getting hit: ', url);
    console.log('Fetching for path:', path, 'deckTitle:', deck_id);
    return this.http.get<ProjectCard[]>(url, { headers }).pipe(
      tap(cards => this.cache.set(cacheKey, cards))
    );
  }

  clearCache(): void {
    this.cache.clear();
  }

}
