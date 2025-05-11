import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectCard } from '../services/project-cards.service';

@Component({
  selector: 'app-hand',
  imports: [CommonModule],
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

}
