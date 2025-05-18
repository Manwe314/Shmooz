import { Component, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
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
  @Input() id?: string;
  @Output() deckSelected = new EventEmitter<{ id: string; origin: { x: number; y: number } }>();
  @ViewChild('deckEl', { static: true }) deckEl!: ElementRef<HTMLDivElement>;

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
    const rect = this.deckEl.nativeElement.getBoundingClientRect();
    const origin = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  
    this.deckSelected.emit({ id: this.id!, origin });
  
    console.log('Deck clicked:', this.id, 'at', origin);
  }
}
