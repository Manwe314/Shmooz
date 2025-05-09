import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeckDisplayWheelComponent } from '../deck-display-wheel/deck-display-wheel.component';
import { LandingBackgroundComponent } from '../landing-background/landing-background.component';
import { HandComponent } from '../hand/hand.component';
import { SlugService } from '../services/slug.service';
import { ProjectCardsService } from '../services/project-cards.service';
import { ProjectCard } from '../services/project-cards.service';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, DeckDisplayWheelComponent, LandingBackgroundComponent, HandComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  cards = signal<ProjectCard[]>([]);
  
  constructor(
    private projectCardService: ProjectCardsService,
    private slugService: SlugService,
  ) {}

  onDeckSelected(deckTitle: string) {
    this.slugService.slug$
    .pipe(
      filter(slug => slug !== null),
      switchMap(slug => this.projectCardService.getCardsForDeck(slug!, deckTitle))
    )
    .subscribe(cards => {
      this.cards.set(cards);
      console.log('Project cards to show: ', cards);
    });
  }

}
