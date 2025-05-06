import { Component, OnInit } from '@angular/core';
import { DeckService, Deck } from '../services/deck.service';
import { SlugService } from '../services/slug.service';
import { DeckComponent } from '../deck/deck.component';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-deck-display-wheel',
  imports: [DeckComponent],
  templateUrl: './deck-display-wheel.component.html',
  styleUrl: './deck-display-wheel.component.css'
})
export class DeckDisplayWheelComponent {
  decks: Deck[] = [];
  
  constructor(
    private deckService: DeckService,
    private slugService: SlugService,
  ) {}

  ngOnInit() {
    this.slugService.slug$
    .pipe(
      filter(slug => slug !== null),
      switchMap(slug => this.deckService.getDecks(slug!))
    )
    .subscribe(decks => {
      console.log('Decks I got: ', decks);
      this.decks =  decks;
    })
  }

  getImageUrl(path: string): string {
    return `https://127.0.0.1${path}`
  }

}
