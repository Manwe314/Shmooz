import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { DeckService } from '../services/deck.service';
import { SlugService } from '../services/slug.service';

@Injectable({ providedIn: 'root' })
export class deckResolver implements Resolve<boolean> {
  constructor(
    private slugService: SlugService,
    private deckService: DeckService
  ){}

  resolve(){
    const slug = this.slugService.getCurrentSlug() ?? 'shmooz'

    return this.deckService.getDecks(slug).pipe(
      tap(data => this.deckService.setResolvedDecks(data)),
      map(() => true),
      catchError(err => {
        console.log('[Deck Resolver] failed to load deck data', err);
        return of(true);
      })
    )
  }
}
