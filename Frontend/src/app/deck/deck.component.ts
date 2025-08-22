import { Component, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Deck } from '../services/deck.service';
import { inject } from '@angular/core';
import { PlatformService } from '../services/platform.service';

@Component({
  standalone: true,
  selector: 'app-deck',
  imports: [CommonModule, NgOptimizedImage],
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
  text_color: string = '';
  hover_color: string = '';

  @Input() isLcp = false;
  @Input() focusable = true;
  @Output() deckSelected = new EventEmitter<{ id: string; origin: { x: number; y: number } }>();
  @ViewChild('deckEl', { static: true }) deckEl!: ElementRef<HTMLDivElement>;

  private platform = inject(PlatformService);

  @Input()
  set deck(value: Deck)
  {
    this.id = value.id;
    this.displayName = value.displayed_name;
    this.imageUrl = this.getImageUrl(value.image_url || '');
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
    this.text_color = value.text_color ?? "#fff";
    this.hover_color = value.hover_color ? value.hover_color : this.toRgba('#e0f804', 1);

    this.cards = Array.from({ length: this.card_amount }, (_, i) => i);
    console.log(value.image_url);
  }

  ensure(val: number[] | undefined, fallback: number[]): number[] {
    return Array.isArray(val) && val.length > 0 && this.card_amount != 0
      ? val
      : fallback;
  }

  toRgba(input: string, alpha: number): string {
    const hex = input.trim();

    if (hex.startsWith('rgba')) {
      return hex.replace(/rgba\(([^)]+)\)/, (_, inner) => {
        const parts = inner.split(',').map((s: string) => s.trim());
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
      });
    }
    if (hex.startsWith('rgb(')) {
      return hex.replace(/rgb\(([^)]+)\)/, (_, inner) => `rgba(${inner}, ${alpha})`);
    }

    const clean = hex.replace('#', '');
    let r: number, g: number, b: number;
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16);
      g = parseInt(clean[1] + clean[1], 16);
      b = parseInt(clean[2] + clean[2], 16);
    } else {
      r = parseInt(clean.slice(0, 2), 16);
      g = parseInt(clean.slice(2, 4), 16);
      b = parseInt(clean.slice(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }


  hovered = false;

  getDeckCardsStyle(card: number): Record<string, string> {
    const idx = Math.max(0, Math.min(card, Math.max(this.card_amount - 1, 0)));

    const isHovered = this.hovered;

    const x_offset = (isHovered ? this.hover_x_offsets[idx] : this.x_offsets[idx]) ?? 0;
    const y_offset = (isHovered ? this.hover_y_offsets[idx] : this.y_offsets[idx]) ?? 0;
    const rotation = (isHovered ? this.hover_rotations[idx] : this.rotations[idx]) ?? 0;
    const brightness = (isHovered ? this.hover_brightness[idx] : this.brightness[idx]) ?? 1;
    const blur = isHovered ? 0 : 0.4;
    const alpha = this.alphas[idx] ?? 0;

    const index = 40 - (10 * idx);

    return {
      'z-index': `${index}`,
      'background-image': `linear-gradient(rgba(0,0,0,${alpha}), rgba(0,0,0,${alpha})), url('${this.imageUrl}')`,
      'transform': `translateX(${x_offset}px) translateY(${y_offset}px) rotate(${rotation}deg)`,
      'filter': `brightness(${brightness}) blur(${blur}px)`,
    };
  }

  handleClick() {
    if (!this.platform.isBrowser()) return;
    
    const host = this.deckEl?.nativeElement;
    if (!host) return;

    const rect = this.deckEl.nativeElement.getBoundingClientRect();
    const origin = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  
    this.deckSelected.emit({ id: this.id!, origin });
  
    console.log('Deck clicked:', this.id, 'at', origin);
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    //URL
    return `https://127.0.0.1:8080${path}`
  }
}
