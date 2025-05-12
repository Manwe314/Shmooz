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

}
