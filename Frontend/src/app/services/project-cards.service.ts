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
  deckTitle: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectCardsService {
  private http = inject(HttpClient);
  private cache = new Map<string, ProjectCard[]>();

  getCardsForDeck(path: string, deckTitle: string): Observable<ProjectCard[]> {
    const cacheKey = `${path}::${deckTitle}`;
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    const url = path ?  `http://backend:8000/api/projects/${path}` : `http://backend:8000/api/projects/` ;
    const headers = new HttpHeaders({
      'X-deck-title': deckTitle
    });

    console.log('url im hitting: ', url);
    return this.http.get<ProjectCard[]>(url, { headers }).pipe(
      tap(cards => this.cache.set(cacheKey, cards))
    );
  }

  clearCache(): void {
    this.cache.clear();
  }

}
