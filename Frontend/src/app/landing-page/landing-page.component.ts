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

  onDeckSelected(deck_id: string) {
    this.slugService.slug$
    .pipe(
      filter(slug => slug !== null),
      switchMap(slug => this.projectCardService.getCardsForDeck(slug!, deck_id))
    )
    .subscribe({
      next: (cards) => {
        this.cards.set(cards);
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
