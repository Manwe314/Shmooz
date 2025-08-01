import { Component, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deck } from '../services/deck.service';

@Component({
  selector: 'app-deck',
  imports: [CommonModule],
  templateUrl: './deck.component.html',
  styleUrls: ['./deck.component.css'],
})
export class DeckComponent {
  id: string = '';
  displayName: string = '';
  imageUrl: string = '';
  hoverImg: string = '';
  card_amount: number = 4;
  x_offsets: number[] = [];
  y_offsets: number[] = [];
  rotations: number[] = [];
  alphas: number[] = [];
  brightness: number[] = [];
  cards: number[] = [];

  @Output() deckSelected = new EventEmitter<{ id: string; origin: { x: number; y: number } }>();
  @ViewChild('deckEl', { static: true }) deckEl!: ElementRef<HTMLDivElement>;

  @Input()
  set deck(value: Deck)
  {
    this.id = value.id;
    this.displayName = value.displayed_name;
    this.imageUrl = this.getImageUrl(value.image_url ?? '');
    this.hoverImg = this.getImageUrl(value.hover_img_url ?? '');
    this.card_amount = value.card_amount ?? 4;
    this.x_offsets = (Array.isArray(value.x_offsets) && value.x_offsets.length > 0 && this.card_amount != 0) ? value.x_offsets : [3, 5, 1, -10];
    this.y_offsets = (Array.isArray(value.y_offsets) && value.y_offsets.length > 0 && this.card_amount != 0) ? value.y_offsets : [1, 0, 4, 1];
    this.rotations = (Array.isArray(value.rotations) && value.rotations.length > 0 && this.card_amount != 0) ? value.rotations : [-3, -9, 2, 7];
    this.alphas = (Array.isArray(value.alphas) && value.alphas.length > 0 && this.card_amount != 0) ? value.alphas : [0.2, 0.25, 0.3, 0.3];
    this.brightness = (Array.isArray(value.brightness) && value.brightness.length > 0 && this.card_amount != 0) ? value.brightness : [0.85, 0.80, 0.75, 0.70];
    this.cards = Array.from({ length: this.card_amount }, (_, i) => i);
    console.log('[DeckComponent] hoverImg resolved to:', value.hover_img_url);
  }


  hovered = false;

  getDeckCardsStyle(card: number): Record<string, string> {
    if (card >= this.card_amount)
      card = this.card_amount;
    const index = 40 - (10 * card);
    return {
      'z-index': `${index}`,
      'background-image': `linear-gradient(rgba(0,0,0,${this.alphas[card]}), rgba(0,0,0,${this.alphas[card]})), url('${this.imageUrl}')`,
      'transform': `translateX(${this.x_offsets[card]}px) translateY(${this.y_offsets[card]}px) rotate(${this.rotations[card]}deg)`,
      'filter': `brightness(${this.brightness[card]})`,
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

  getImageUrl(path: string): string {
    //URL
    return `https://127.0.0.1:8080${path}`
  }
}
