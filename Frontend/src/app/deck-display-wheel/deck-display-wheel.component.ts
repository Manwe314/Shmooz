import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, effect, OnInit, Output, EventEmitter } from '@angular/core';
import { DeckService, Deck } from '../services/deck.service';
import { SlugService } from '../services/slug.service';
import { DeckComponent } from '../deck/deck.component';
import { filter, switchMap } from 'rxjs';
import { fromEvent, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-deck-display-wheel',
  imports: [DeckComponent, CommonModule],
  templateUrl: './deck-display-wheel.component.html',
  styleUrl: './deck-display-wheel.component.css',
})
export class DeckDisplayWheelComponent implements AfterViewInit, OnDestroy{
  decks: Deck[] = [];
  deckWidth = 330;
  mingap = 50;
  
  maxVisibleDecks = 1;
  currentPage = 0;
  actualGap = 50;
  ellipseRadiusX = 0;
  ellipseRadiusY = 0;
  ellipseStepAngle = 0.13;
  //BASE + backend.
  ellipseXPadding = 0;
  ellipseYPadding = 0;


  constructor(
    private deckService: DeckService,
    private slugService: SlugService,
  ) {}
  private resizeSub?: Subscription;

  @ViewChild('deckContainer', { static: true }) deckContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('deckMaskRef') deckMaskRef!: ElementRef<HTMLDivElement>;
  @Output() deckSelected = new EventEmitter<{ id: string; origin: { x: number; y: number } }>();

  ngAfterViewInit() {
    this.decks = this.deckService.getResolvedDeck();
    setTimeout(() => this.updateLayout(), 0);
    if (typeof window !== 'undefined') {
      this.resizeSub = fromEvent(window, 'resize').subscribe(() => this.updateLayout());
    }
  }

  getEllipseDeckStyle(index: number): Record<string, string> {
    const deckCount = this.decks.length;
    const visibleCount = Math.min(deckCount, this.maxVisibleDecks);

    // Actual decks being rendered in this page:
    const firstVisibleDeck = this.currentPage;
    const lastVisibleDeck = Math.min(this.currentPage + visibleCount - 1, deckCount - 1);

    // This card’s index within the visible set:
    const relativeIndex = index - firstVisibleDeck;

    // Calculate center shift
    const mid = (visibleCount - 1) / 2;

    // This determines the card's angle on the ellipse
    let angle: number;
    if (visibleCount % 2 === 1) {
      angle = (relativeIndex - mid) * this.ellipseStepAngle;
    } else {
      const half = visibleCount / 2;
      if (relativeIndex < half)
        angle = ((-(half - relativeIndex)) * this.ellipseStepAngle) + (this.ellipseStepAngle / 2);
      else
        angle = ((relativeIndex - half + 1) * this.ellipseStepAngle) - (this.ellipseStepAngle / 2);
    }

    // Position on ellipse
    const x = this.ellipseRadiusX * Math.sin(angle);
    const y = -this.ellipseRadiusY * (1 - Math.cos(angle)) + 40; // lift the arc slightly

    // Tangent rotation angle (but very small adjustment only)
    const dx = this.ellipseRadiusX * Math.cos(angle);
    const dy = -this.ellipseRadiusY * Math.sin(angle);
    const tangentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    const rotation = tangentAngle; // Subtract 90 so default is upright

    // Handle offscreen decks (before/after visible range)
    if (relativeIndex < 0) {
      return {
        transform: `translate(-50%, -50%) translateX(-2000px)`,
        transition: 'transform 0.5s ease',
        position: 'absolute',
        left: '50%',
        top: '50%',
      };
    }

    if (relativeIndex >= visibleCount) {
      return {
        transform: `translate(-50%, -50%) translateX(2000px)`,
        transition: 'transform 0.5s ease',
        position: 'absolute',
        left: '50%',
        top: '50%',
      };
    }

    // Default visible cards
    return {
      transform: `
        translate(-50%, -50%)
        translateX(${x}px)
        translateY(${y}px)
        rotate(${rotation}deg)
      `,
      transition: 'transform 0.5s ease',
      position: 'absolute',
      left: '50%',
      top: '20%',
    };
  }

  ngOnDestroy(): void {
    this.resizeSub?.unsubscribe();
  }

  get totalPages(): number {
    return Math.max((this.decks.length - this.maxVisibleDecks) + 1, 1);
  }

  get canScrollNext(): boolean {
    return this.currentPage < this.totalPages - 1;
  }

  get canScrollPrev(): boolean {
    return this.currentPage > 0;
  }

  prevPage() {
    this.currentPage = Math.max(this.currentPage - 1, 0);
  }

  nextPage() {
    const maxPage = this.totalPages - 1;
    this.currentPage = Math.min(this.currentPage + 1, maxPage);
  }
 
  getTransform(): string {
    const offset = this.currentPage * (this.deckWidth + this.actualGap);
    return `translateX(-${offset}px)`;
  }

  updateLayout(): void {
    const maskWidth = this.deckMaskRef.nativeElement.offsetWidth;
    let totalDeckWidth: any;
    let gaps: any;

    const maxFittable = Math.floor((maskWidth - this.mingap) / (this.deckWidth + this.mingap));
    this.maxVisibleDecks = Math.max(1, maxFittable);
    console.log('max amount of decks fittable: ', this.maxVisibleDecks);

    if (this.decks.length < this.maxVisibleDecks) {
      totalDeckWidth = this.decks.length * this.deckWidth;
      gaps = this.decks.length + 1;
    }
    else {
      totalDeckWidth = this.maxVisibleDecks * this.deckWidth;
      gaps = this.maxVisibleDecks + 1;
    }
    const leftoverSpace = maskWidth - totalDeckWidth;

    this.actualGap = Math.round(leftoverSpace / gaps);

    this.ellipseRadiusX = window.innerWidth + this.ellipseXPadding;
    this.ellipseRadiusY = (this.deckMaskRef.nativeElement.offsetHeight / 2) + this.ellipseYPadding;
    if (this.ellipseRadiusX > 0) {
      this.ellipseStepAngle = (this.deckWidth + this.actualGap) / this.ellipseRadiusX;
    } else {
      console.warn('⚠️ ellipseRadiusX is 0! Step angle is using default value.');
    }
 
    this.currentPage = 0;
  }
  
  onDeckClicked(deckData: { id: string; origin: { x: number; y: number } }) {
    this.deckSelected.emit(deckData);
  }

  getImageUrl(path: string): string {
    //URL
    return `https://127.0.0.1:8080${path}`
  }

}
