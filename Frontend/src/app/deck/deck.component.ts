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

  handleClick() {
    console.log('Deck clicked:', this.title || this.displayName);
  }
}
