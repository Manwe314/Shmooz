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
  deckOrigin: { x: number; y: number } | null = null;
  isTransitioning = false;
  pendingDeckClick: { id: string; origin: { x: number; y: number } } | null = null;
  
  constructor(
    private projectCardService: ProjectCardsService,
    private slugService: SlugService,
  ) {}

  onDeckSelected(deckData: { id: string; origin: { x: number; y: number } }) {
    if (this.isTransitioning) {
     this.pendingDeckClick = deckData; // Save most recent click
     return;
    }

    this.executeDeckSelection(deckData);
  }

  executeDeckSelection(deckData: { id: string; origin: { x: number; y: number } }) {
    const { id, origin } = deckData;
    this.deckOrigin = origin;

    this.slugService.slug$
      .pipe(
        filter(slug => slug !== null),
        switchMap(slug => this.projectCardService.getCardsForDeck(slug!, id))
      )
      .subscribe({
        next: (cards) => {
          const numCards = cards.length;

          const discardDuration = numCards * 70 + 250;
          const enterDuration = numCards * 120 + 120 + 800;
          const totalDuration = discardDuration + enterDuration + 5;

          this.isTransitioning = true;
          this.cards.set(cards);

          setTimeout(() => {
            this.isTransitioning = false;

            if (this.pendingDeckClick) {
              const pending = this.pendingDeckClick;
              this.pendingDeckClick = null;
              this.executeDeckSelection(pending);
            }
          }, totalDuration);
        },
        error: (err: { status: any; message: any; error: any; url: any }) => {
        console.error("🔥 ERROR fetching cards");
        console.error("Status:", err.status);
        console.error("Message:", err.message);
        console.error("Error:", err.error);
        console.error("URL:", err.url);
      }
    });
  }

}
