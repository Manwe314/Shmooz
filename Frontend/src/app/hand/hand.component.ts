import { Component, ElementRef, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectCard } from '../services/project-cards.service';
import { ProjectCardComponent } from '../project-card/project-card.component';
import { Router } from '@angular/router';
import { SlugService } from '../services/slug.service';
import { TransitionService } from '../services/transition.service';

@Component({
  selector: 'app-hand',
  imports: [CommonModule, ProjectCardComponent],
  templateUrl: './hand.component.html',
  styleUrl: './hand.component.css',
})
export class HandComponent {
  private _cards: ProjectCard[] = [];
  hoveredIndex: number | null = null;
  playingCardIndex: number | null = null;
  constructor(private router: Router, private slugService: SlugService, private transitionService: TransitionService) {}
  cardBasePoint: { x: number, y: number } | null = null;
  @Input() deckOrigin: { x: number; y: number } | null = null;
  @ViewChild('handContainerRef', { static: true }) handContainerRef!: ElementRef<HTMLDivElement>;
  @Input() cards: ProjectCard[] = [];

  get displayedCards(): ProjectCard[] {
    return this._cards;
  }

  setHovered(index: number | null): void {
    this.hoveredIndex = index;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.deckOrigin || !changes['cards'] || !this.cards?.length){
      console.log("TUTUTUT");
      return;
    }
    if (changes['cards']) {
      console.log('[HandComponent] received cards:', this.cards);
      console.log('🧭 Deck origin received in hand:', this.deckOrigin);
    }

    const containerRect = this.handContainerRef.nativeElement.getBoundingClientRect();
    const toX = containerRect.left + containerRect.width / 2;
    const toY = containerRect.bottom;

    const fromX = this.deckOrigin.x;
    const fromY = this.deckOrigin.y;

    const cardWidth = 205;
    const cardHeight = 275;

    const offsetX = (fromX - toX) - (cardWidth / 2);
    const offsetY = (fromY - toY) + (cardHeight / 2);

    if (this._cards.length > 0) {
      this._cards.forEach((card, index) => {
        setTimeout(() => {
          card.animationState = 'discarding';
        }, index * 70);
      });

      setTimeout(() => {
        this._cards = this.cards.map(card => ({
          ...card,
          animationState: 'entering',
          offsetX,
          offsetY,
        }));

        this._cards.forEach((card, index) => {
          setTimeout(() => {
            card.animationState = 'inHand';
          }, (index * 120) + 120);
        });
      }, (this._cards.length * 70) + 250);
    } else {
      this._cards = this.cards.map(card => ({
        ...card,
        animationState: 'entering',
        offsetX,
        offsetY,
      }));

      this._cards.forEach((card, index) => {
        setTimeout(() => {
          card.animationState = 'inHand';
        }, (index * 120) + 120);
      });
    }
  }
  

  computeArgument(index: number, total: number): number{
    const step_angle = 0.13;
    if (total % 2 === 1){
      return (index - (total - 1) / 2) * step_angle;
    }
    else{
      const half = total / 2;
      if (index < half)
        return ((-(half - index)) * step_angle) + (step_angle / 2);
      else
        return ((index - half + 1) * step_angle) - (step_angle / 2);
    }
  }

  getCardTransform(index: number, total: number, card: ProjectCard): string {
    const argument = this.computeArgument(index, total);
    const horizontalRadius = 475 * 3;
    const vertiacalRadius = 275 * 3;
    const globalLower = 30;
    const xOffset = horizontalRadius * Math.sin(argument); 
    const yoffset = vertiacalRadius * (1 - Math.cos(argument)) + globalLower; 
    const rotation = Math.atan2(vertiacalRadius * Math.sin(argument), horizontalRadius * Math.cos(argument)) * (180 / Math.PI);
    

    if (card.animationState === 'entering') {
      const x = card.offsetX ?? 0;
      const y = card.offsetY ?? 0;
      return `translate(${x}px, ${y}px) scale(0.7) rotate(-90deg)`;
    }

    // if (card.animationState === 'discarding') {
    //   return `translate(-50%)`;
    // }

    if (this.hoveredIndex === index) {
      return `translateX(-50%) translateX(${xOffset}px) translateY(${yoffset}px) translateY(${-yoffset - 40}px)`;
    }
  
    if (this.hoveredIndex !== null) {
      const shiftTotal = 28;
      const rotationTotal = total > 6 ? total + 2 : total;
      const distance = index - this.hoveredIndex;
      const lateralShift = shiftTotal / distance;
      const rotationalShift = rotationTotal / distance;
      return ` translateX(-50%) translateX(${xOffset}px) translateX(${lateralShift}px) translateY(${yoffset}px) rotate(${rotation}deg) rotate(${rotationalShift}deg)`;
    }

    return `translateX(-50%) translateX(${xOffset}px) translateY(${yoffset}px) rotate(${rotation}deg)`;
  }
  
  onCardClicked(card: ProjectCard, index: number) {
    const slug = this.slugService.getCurrentSlug() ?? 'COMPANY';
    const handContainer = this.handContainerRef.nativeElement;
    const cardEls = handContainer.querySelectorAll('.hand-card');
    const clickedCardEl = cardEls[index] as HTMLElement;
    const clone = this.transitionService.createClone(clickedCardEl);
    
    if (!clickedCardEl) {
      console.warn('Could not find clicked card element!');
      return;
    }
    clickedCardEl.style.transition = 'none';
    clickedCardEl.style.opacity = '0';
    clone.classList.add('playing');
    this.transitionService.blockNavigation(); 
    
    setTimeout(() => {
      requestAnimationFrame(() => {
        clone.classList.add('fullscreen');
      });

      this.router.navigate([`/project_page/${card.id}`], {
        queryParams: { slug }
      });

      setTimeout(() => {
        this.transitionService.unblockRoute();
      }, 100000);
    }, 750); 
  }
}
