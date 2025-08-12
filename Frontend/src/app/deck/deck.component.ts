import { Component, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deck } from '../services/deck.service';

@Component({
  standalone: true,
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
  hover_x_offsets: number[] = [];
  hover_y_offsets: number[] = [];
  hover_rotations: number[] = [];
  hover_brightness: number[] = [];
  cards: number[] = [];

  @Output() deckSelected = new EventEmitter<{ id: string; origin: { x: number; y: number } }>();
  @ViewChild('deckEl', { static: true }) deckEl!: ElementRef<HTMLDivElement>;

  @Input()
  set deck(value: Deck)
  {
    this.id = value.id;
    this.displayName = value.displayed_name;
    this.imageUrl = this.getImageUrl(value.image_url ?? '');
    this.hoverImg = value.hover_img_url ?  this.getImageUrl(value.hover_img_url) : '';
    this.card_amount = value.card_amount ?? 4;
    this.x_offsets = this.ensure(value.x_offsets, [3, 5, 1, -10]);
    this.y_offsets = this.ensure(value.y_offsets, [1, 0, 4, 1]);
    this.rotations = this.ensure(value.rotations, [-3, -9, 2, 7]);
    this.alphas = this.ensure(value.alphas, [0.15, 0.20, 0.25, 0.25]);
    this.brightness = this.ensure(value.brightness, [0.9, 0.85, 0.80, 0.75]);
    this.hover_x_offsets = this.ensure(value.hover_x_offsets, [-15, -15, -3, 5]);
    this.hover_y_offsets = this.ensure(value.hover_y_offsets, [28, 43, -20, 55]);
    this.hover_rotations = this.ensure(value.hover_rotations, [-8, 20, 5, 7]);
    this.hover_brightness = this.ensure(value.hover_brightness, [0.95, 0.9, 0.85, 0.8]);

    this.cards = Array.from({ length: this.card_amount }, (_, i) => i);
    console.log('[DeckComponent] hoverImg resolved to:', value.hover_img_url);
  }

  ensure(val: number[] | undefined, fallback: number[]): number[] {
    return Array.isArray(val) && val.length > 0 && this.card_amount != 0
      ? val
      : fallback;
  }


  hovered = false;

  getDeckCardsStyle(card: number): Record<string, string> {
    if (card >= this.card_amount) card = this.card_amount;

    const isHovered = this.hovered;

    const x_offset = isHovered ? this.hover_x_offsets[card] : this.x_offsets[card];
    const y_offset = isHovered ? this.hover_y_offsets[card] : this.y_offsets[card];
    const rotation = isHovered ? this.hover_rotations[card] : this.rotations[card];
    const brightness = isHovered ? this.hover_brightness[card] : this.brightness[card];
    const blur = isHovered ? 0 : 0.4;
    const alpha = this.alphas[card];

    const index = 40 - (10 * card);

    return {
      'z-index': `${index}`,
      'background-image': `linear-gradient(rgba(0,0,0,${alpha}), rgba(0,0,0,${alpha})), url('${this.imageUrl}')`,
      'transform': `translateX(${x_offset}px) translateY(${y_offset}px) rotate(${rotation}deg)`,
      'filter': `brightness(${brightness}), blur(${blur}px)`,
    };
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
