import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Deck {
  title: string;
  displayed_name: string;
  owner: string;
  image_url: string;
  image: string;
}

@Injectable({
  providedIn: 'root' 
})
export class DeckService {
  private http = inject(HttpClient);

  getDecks(path: string) : Observable<Deck[]> {
    const endpoint = path ? `http://backend:8000/api/deck/${path}` : `http://backend:8000/api/deck/COMPANY`
    return this.http.get<Deck[]>(endpoint);
  }
}