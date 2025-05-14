import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectCard } from '../services/project-cards.service';
import { ProjectCardComponent } from '../project-card/project-card.component';

@Component({
  selector: 'app-hand',
  imports: [CommonModule, ProjectCardComponent],
  templateUrl: './hand.component.html',
  styleUrl: './hand.component.css'
})
export class HandComponent {
  @Input() cards: ProjectCard[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cards']) {
      console.log('[HandComponent] received cards:', this.cards);
    }
  }

  getCardTransform(index: number, total: number): string {
    if (total === 1) {
      return `translateY(20%)`;
    }
    
    const min_low = 15;
    const spread = Math.min(30, total * 6);
    const offset = index - (total - 1) / 2;
    const angle = offset * (spread / total);
    const lift =  (Math.abs(offset) * 5) + min_low;
  
    return `translateY(${lift}%) rotate(${angle}deg)`;
  }

}
