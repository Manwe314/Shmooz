import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, effect, OnInit, Output, EventEmitter, ViewChildren, QueryList  } from '@angular/core';
import { DeckService, Deck } from '../services/deck.service';
import { SlugService } from '../services/slug.service';
import { DeckComponent } from '../deck/deck.component';
import { filter, switchMap} from 'rxjs';
import { fromEvent, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgZone } from '@angular/core';
import { first } from 'rxjs/operators';
import { PageDetails } from '../services/background.service';
import { BackgroundService } from '../services/background.service';
import { inject } from '@angular/core';
import { PlatformService } from '../services/platform.service';


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
  has_fadedin = false;
  has_animation = false;
  arrowColor = "";
  needsArrows = false;
  
  constructor(
    private deckService: DeckService,
    private slugService: SlugService,
    private zone: NgZone,
    private backGround: BackgroundService,
  ) {}
  private resizeSub?: Subscription;
  private platform = inject(PlatformService);
  
  @ViewChild('deckContainer', { static: true }) deckContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('deckMaskRef') deckMaskRef!: ElementRef<HTMLDivElement>;
  @ViewChildren('deckSlideRef') deckSlides!: QueryList<ElementRef<HTMLDivElement>>;
  @Output() deckSelected = new EventEmitter<{ id: string; origin: { x: number; y: number } }>();
  
  ellipseXPadding = 0;
  ellipseYPadding = 0;
  
  ngAfterViewInit() {
    const current = this.slugService.getCurrentSlug() ?? 'shmooz';
    this.deckService.hydrateFromTransferState(current);
    const backgroundDetails = this.backGround.getPageDetail();
    this.ellipseXPadding = backgroundDetails!.ellipseWidth;
    this.ellipseRadiusY = backgroundDetails!.ellipseHeight;
    this.arrowColor = backgroundDetails!.arrowColor;
    this.decks = this.deckService.getResolvedDeck();

    if (!this.platform.isBrowser()) {
      // Optional SSR defaults to keep markup stable
      this.maxVisibleDecks = Math.max(1, Math.min(this.decks.length || 1, 3));
      this.actualGap = this.mingap;
      this.ellipseRadiusX = this.platform.windowRef.innerWidth + this.ellipseXPadding;
      this.ellipseStepAngle = (this.deckWidth + this.actualGap) / Math.max(this.ellipseRadiusX, 1);
      return;
    }

    setTimeout(() => {
      this.updateLayout();
      this.zone.onStable.pipe(first()).subscribe(() => {
      this.enableTransitions();
    });
    }, 0);
    const win = this.platform.windowRef;
    this.resizeSub = fromEvent(win as unknown as EventTarget, 'resize').subscribe(() => this.updateLayout());

  }

  getEllipseDeckStyle(index: number): Record<string, string> {
    const deckCount = this.decks.length;
    const visibleCount = Math.min(deckCount, this.maxVisibleDecks);
    const firstVisibleDeck = this.currentPage;

    const relativeIndex = index - firstVisibleDeck;

    const mid = (visibleCount - 1) / 2 + 2 -2;

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

    const x = this.ellipseRadiusX * Math.sin(angle);
    const y = -this.ellipseRadiusY * (1 - Math.cos(angle)) + 40;

    const dx = this.ellipseRadiusX * Math.cos(angle);
    const dy = -this.ellipseRadiusY * Math.sin(angle);
    const tangentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    const rotation = tangentAngle;

    if (relativeIndex < 0) {
      const point = this.getOffscreenPoint('left');
      return {
        transform: `
          translate(-50%, -50%)
          translateX(${point.x}px)
          translateY(${point.y}px)
          rotate(${point.rotation}deg)
        `,
        position: 'absolute',
        left: '50%',
        top: '27%',
        opacity: this.has_fadedin ? '1' : '0',
      };
    }

    if (relativeIndex >= visibleCount) {
      const point = this.getOffscreenPoint('right');
      return {
        transform: `
          translate(-50%, -50%)
          translateX(${point.x}px)
          translateY(${point.y}px)
          rotate(${point.rotation}deg)
        `,
        position: 'absolute',
        left: '50%',
        top: '27%',
        opacity: this.has_fadedin ? '1' : '0',
      };
    }

    return {
      transform: `
        translate(-50%, -50%)
        translateX(${x}px)
        translateY(${y}px)
        rotate(${rotation}deg)
      `,
      position: 'absolute',
      left: '50%',
      top: '27%',
      opacity: this.has_fadedin ? '1' : '0'
    };
  }

  getOffscreenPoint(direction: 'left' | 'right') {
    const angleOffset = ((this.maxVisibleDecks / 2) + 1.5) * this.ellipseStepAngle * (direction === 'left' ? -1 : 1);

    const x = this.ellipseRadiusX * Math.sin(angleOffset);
    const y = -this.ellipseRadiusY * (1 - Math.cos(angleOffset)) + 40;

    const dx = this.ellipseRadiusX * Math.cos(angleOffset);
    const dy = -this.ellipseRadiusY * Math.sin(angleOffset);
    const rotation = Math.atan2(dy, dx) * (180 / Math.PI);

    return { x, y, rotation };
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
 
  enableTransitions() {
    if (!this.platform.isBrowser()) return;
    this.deckSlides?.forEach((el: ElementRef<HTMLDivElement>) => {
      el.nativeElement.style.transition = 'opacity 0.8s ease';
      el.nativeElement.style.opacity = '1';
      this.has_fadedin = true;
    });
  }

  prevPage() {
    if (!this.has_animation) {
      if (this.platform.isBrowser()) {
        this.deckSlides?.forEach((el: ElementRef<HTMLDivElement>) => {
          el.nativeElement.style.transition = 'transform 0.7s cubic-bezier(.42,.19,.5,1.37)';
        });
      }
      this.has_animation = true;
    }
    this.currentPage = Math.max(this.currentPage - 1, 0);
  }

  nextPage() {
    if (!this.has_animation) {
      if (this.platform.isBrowser()) {
        this.deckSlides?.forEach((el: ElementRef<HTMLDivElement>) => {
          el.nativeElement.style.transition = 'transform 0.7s cubic-bezier(.42,.19,.5,1.37)';
        });
      }
      this.has_animation = true;
    }
    const maxPage = this.totalPages - 1;
    this.currentPage = Math.min(this.currentPage + 1, maxPage);
  }
 
  getTransform(): string {
    const offset = this.currentPage * (this.deckWidth + this.actualGap);
    return `translateX(-${offset}px)`;
  }

  updateLayout(): void {
    if (!this.platform.isBrowser()) {
      const viewportW = this.platform.windowRef.innerWidth || 1280;
      const maskWidth = viewportW - 80; // rough SSR guess to avoid NaN
      const maxFittable = Math.floor((maskWidth - this.mingap) / (this.deckWidth + this.mingap));
      this.maxVisibleDecks = Math.max(1, isFinite(maxFittable) ? maxFittable : 1);
      this.actualGap = this.mingap;
      this.ellipseRadiusX = viewportW + this.ellipseXPadding;
      this.ellipseStepAngle = (this.deckWidth + this.actualGap) / Math.max(this.ellipseRadiusX, 1);
      this.currentPage = 0;
      return;
    }
    const maskWidth = this.deckMaskRef?.nativeElement?.offsetWidth ?? 0;
    let totalDeckWidth: any;
    let gaps: any;

    const maxFittable = Math.floor((maskWidth - this.mingap) / (this.deckWidth + this.mingap));
    this.maxVisibleDecks = Math.max(1, maxFittable);
    console.log('max amount of decks fittable: ', this.maxVisibleDecks);

    if (this.decks.length < this.maxVisibleDecks) {
      totalDeckWidth = this.decks.length * this.deckWidth;
      gaps = this.decks.length + 1;
      this.needsArrows = false;
    }
    else {
      totalDeckWidth = this.maxVisibleDecks * this.deckWidth;
      gaps = this.maxVisibleDecks + 1;
      this.needsArrows = true;
    }
    const leftoverSpace = maskWidth - totalDeckWidth;

    this.actualGap = Math.round(leftoverSpace / gaps);

    this.ellipseRadiusX = this.platform.windowRef.innerWidth + this.ellipseXPadding;
    this.ellipseRadiusY = (this.deckMaskRef?.nativeElement?.offsetHeight ?? 0) / 2 + this.ellipseYPadding;
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


