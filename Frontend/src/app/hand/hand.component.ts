import { Component, ElementRef, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectCard } from '../services/project-cards.service';
import { ProjectCardComponent } from '../project-card/project-card.component';
import { Router } from '@angular/router';
import { SlugService } from '../services/slug.service';

@Component({
  selector: 'app-hand',
  imports: [CommonModule, ProjectCardComponent],
  templateUrl: './hand.component.html',
  styleUrl: './hand.component.css'
})
export class HandComponent {
  private _cards: ProjectCard[] = [];
  hoveredIndex: number | null = null;
  playingCardIndex: number | null = null;
  constructor(private router: Router, private slugService: SlugService) {}
  @Input() deckOrigin: { x: number; y: number } | null = null;
  @ViewChild('handContainerRef', { static: true }) handContainerRef!: ElementRef<HTMLDivElement>;
  @Input() set cards(value: ProjectCard[]) {
    if (!value || !this.deckOrigin) {
      this._cards = value;
      return;
    }

    const containerRect = this.handContainerRef.nativeElement.getBoundingClientRect();
    const toX = containerRect.left + containerRect.width / 2;
    const toY = containerRect.bottom;

    const fromX = this.deckOrigin.x;
    const fromY = this.deckOrigin.y;

    const offsetX = fromX - toX;
    const offsetY = fromY - toY;
    
    this._cards = value.map(card => ({
      ...card,
      animationState: 'entering',
      offsetX,
      offsetY
    }));
  
    this._cards.forEach((card, index) => {
      setTimeout(() => {
        card.animationState = 'inHand';
      }, index * 120);
    });
  }

  get cards(): ProjectCard[] {
    return this._cards;
  }

  setHovered(index: number | null): void {
    this.hoveredIndex = index;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cards']) {
      console.log('[HandComponent] received cards:', this.cards);
      console.log('🧭 Deck origin received in hand:', this.deckOrigin);
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
      return `translate(${x}px, ${y}px) scale(0.7) rotate(0deg)`;
    }

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
    this.playingCardIndex = index;
    const slug = this.slugService.getCurrentSlug() ?? 'COMPANY';

    setTimeout(() => {
      this.router.navigate([`/project_page/${card.id}`], {queryParams: { slug } });
    }, 1000);
  }

  isPlaying(index: number) {
    return this.playingCardIndex === index;
  }

}
