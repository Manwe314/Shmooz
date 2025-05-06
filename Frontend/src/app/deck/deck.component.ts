import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-deck',
  imports: [CommonModule],
  templateUrl: './deck.component.html',
  styleUrls: ['./deck.component.css']
})
export class DeckComponent {
  @Input() displayName: string = '';
  @Input() imageUrl: string = ''; 
  @Input() title?: string;

  hovered = false;
  cards = [0, 1, 2, 3];  

  getDeckCardsStyle(card: number): Record<string, string> {
    const index = 40 - (10 * card);
    const img_alpha = [0.2, 0.25, 0.3, 0.3];
    const xpos = [9, 17, -4, -15];
    const ypos = [14, 18, 0, -10];
    const rotation = [95, 98, 88, 85];
    const brightness = 0.85 - (0.05 * card);
    return {
      'z-index': `${index}`,
      'background-image': `linear-gradient(rgba(0,0,0,${img_alpha[card]}), rgba(0,0,0,${img_alpha[card]})), url('${this.imageUrl}')`,
      'transform': `translateX(${xpos[card]}px) translateY(${ypos[card]}px) rotate(${rotation[card]}deg)`,
      'filter': `brightness(${brightness})`,
    }
  }

  handleClick() {
    console.log('Deck clicked:', this.title || this.displayName);
  }
}
