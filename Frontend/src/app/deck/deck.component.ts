import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Card {
  imageUrl: string;
  id?: string;
}

@Component({
  selector: 'app-deck',
  imports: [CommonModule],
  templateUrl: './deck.component.html',
  styleUrls: ['./deck.component.css']
})
export class DeckComponent {
  @Input() cards: Card[] = [];

  hovered = false;

  getCardStyle(index: number): Record<string, string> {
    const depth = this.cards.length - index - 1;

    const offset = depth * 4; // pixels
    const rotate = depth * 1.5; // degrees
    const brightness = 1 - depth * 0.08;

    return {
      'z-index': `${100 - index}`,
      'transform': `translateY(-${offset}px) rotate(${rotate}deg)`,
      'filter': `brightness(${brightness})`,
    };
  }

  handleClick() {
    console.log('Deck clicked');
  }
}
