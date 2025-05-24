import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Deck {
  id: string;
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
  private api = inject(ApiService);

  getDecks(path: string) : Observable<Deck[]> {
    const endpoint = path ? this.api.buildUrl(`deck/${path}`) : this.api.buildUrl(`deck/COMPANY`)
    return this.http.get<Deck[]>(endpoint);
  }
}