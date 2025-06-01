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

  getCardTransform(index: number, total: number, card: ProjectCard): string {
    const min_low = 15;
    const spread = Math.min(30, total * 6);
    const offset = index - (total - 1) / 2;
    const angle = offset * (spread / total);
    const lift =  (Math.abs(offset) * 5) + min_low;

    if (card.animationState === 'entering') {
      const x = card.offsetX ?? 0;
      const y = card.offsetY ?? 0;
      return `translate(${x}px, ${y}px) scale(0.7) rotate(0deg)`;
    }

    if (this.hoveredIndex === index) {
      return `translateY(${lift - 30}px) rotate(${angle}deg)`;
    }
  
    if (this.hoveredIndex !== null) {
      const distance = index - this.hoveredIndex;
      const lateralShift = distance * 5; // shift away slightly
      return `translate(${lateralShift}px, ${lift}px) rotate(${angle}deg)`;
    }
  
    return `translateY(${lift}%) rotate(${angle}deg)`;
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
