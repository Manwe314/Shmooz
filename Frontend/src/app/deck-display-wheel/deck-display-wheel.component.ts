import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, effect, OnInit, Output, EventEmitter } from '@angular/core';
import { DeckService, Deck } from '../services/deck.service';
import { SlugService } from '../services/slug.service';
import { DeckComponent } from '../deck/deck.component';
import { filter, switchMap } from 'rxjs';
import { fromEvent, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-deck-display-wheel',
  imports: [DeckComponent],
  templateUrl: './deck-display-wheel.component.html',
  styleUrl: './deck-display-wheel.component.css'
})
export class DeckDisplayWheelComponent implements AfterViewInit, OnDestroy{
  decks: Deck[] = [];
  deckWidth = 330;
  mingap = 50;
  
  maxVisibleDecks = 1;
  currentPage = 0;
  actualGap = 50;

  constructor(
    private deckService: DeckService,
    private slugService: SlugService,
  ) {}
  private resizeSub?: Subscription;

  @ViewChild('deckContainer', { static: true }) deckContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('deckMaskRef') deckMaskRef!: ElementRef<HTMLDivElement>;
  @Output() deckSelected = new EventEmitter<{ id: string; origin: { x: number; y: number } }>();

  ngAfterViewInit() {
    this.slugService.slug$
    .pipe(
      filter(slug => slug !== null),
      switchMap(slug => this.deckService.getDecks(slug!))
    )
    .subscribe(decks => {
      console.log('Decks I got: ', decks);
      this.decks =  decks;
      this.updateLayout();
    })
    if (typeof window !== 'undefined') {
      this.resizeSub = fromEvent(window, 'resize').subscribe(() => this.updateLayout());
    }
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

    this.currentPage = 0;
  }
  
  onDeckClicked(deckData: { id: string; origin: { x: number; y: number } }) {
    this.deckSelected.emit(deckData);
  }

  getImageUrl(path: string): string {
    return `https://127.0.0.1${path}`
  }

}
