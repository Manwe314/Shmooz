import { inject,Injectable } from '@angular/core';
import { makeStateKey,TransferState } from '@angular/core';
import { Resolve } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map,tap } from 'rxjs/operators';

import { Deck,DeckService } from '../services/deck.service';
import { SlugService } from '../services/slug.service';

@Injectable({ providedIn: 'root' })
export class deckResolver implements Resolve<boolean> {
  private ts = inject(TransferState);
  constructor(
    private slugService: SlugService,
    private deckService: DeckService,
  ) {}

  resolve() {
    const slug = this.slugService.getCurrentSlug() ?? 'shmooz';
    const KEY = makeStateKey<Deck[]>(`decks:${slug}`);

    const cached = this.ts.get<Deck[]>(KEY, null as any);
    if (cached) {
      this.deckService.setResolvedDecks(cached);
      return of(true);
    }

    return this.deckService.getDecks(slug).pipe(
      tap((data: Deck[]) => {
        this.deckService.setResolvedDecks(data);
        this.ts.set<Deck[]>(KEY, data);
      }),
      map(() => true),
      catchError((err) => {
        console.warn('[Deck Resolver] failed to load deck data', err);
        return of(true);
      }),
    );
  }
}
