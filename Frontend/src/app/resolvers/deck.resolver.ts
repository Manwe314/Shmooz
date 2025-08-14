import { Injectable, inject } from '@angular/core';
import { Resolve } from '@angular/router';
import { of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { DeckService, Deck } from '../services/deck.service';
import { SlugService } from '../services/slug.service';
import { TransferState, makeStateKey } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class deckResolver implements Resolve<boolean> {
  private ts = inject(TransferState);
  constructor(
    private slugService: SlugService,
    private deckService: DeckService
  ){}

  resolve() {
    const slug = this.slugService.getCurrentSlug() ?? 'shmooz';
    const KEY = makeStateKey<Deck[]>(`decks:${slug}`);

    // ✅ If SSR already stored decks, hydrate service & skip HTTP on client
    const cached = this.ts.get<Deck[]>(KEY, null as any);
    if (cached) {
      this.deckService.setResolvedDecks(cached);
      return of(true);
    }

    // Otherwise fetch (on SSR or client), then store in service + TransferState
    return this.deckService.getDecks(slug).pipe(
      tap((data: Deck[]) => {
        this.deckService.setResolvedDecks(data);
        this.ts.set<Deck[]>(KEY, data);
      }),
      map(() => true),
      catchError(err => {
        console.log('[Deck Resolver] failed to load deck data', err);
        return of(true);
      })
    );
  }
}
