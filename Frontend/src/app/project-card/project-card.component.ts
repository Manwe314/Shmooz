import { CommonModule } from '@angular/common';
import { Component, ElementRef,EventEmitter, Input, Output } from '@angular/core';
import { inject } from '@angular/core';

import { PlatformService } from '../services/platform.service';
import { ProjectCard } from '../services/project-cards.service';

@Component({
  selector: 'app-project-card',
  imports: [CommonModule],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css',
})
export class ProjectCardComponent {
  @Input() card!: ProjectCard;
  @Output() cardClicked = new EventEmitter<ProjectCard>();

  constructor(private elRef: ElementRef) {}

  private platform = inject(PlatformService);

  onCardClick() {
    this.cardClicked.emit(this.card);
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.platform.isBrowser()) return;
    if (this.elRef.nativeElement.classList.contains('hand-card-clone')) return;
    const cardEl = this.elRef.nativeElement.querySelector('.card') as HTMLElement;
    const bgEl = this.elRef.nativeElement.querySelector('.card-bg') as HTMLElement;

    const rect = cardEl.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const percentX = x / rect.width - 0.5;
    const percentY = y / rect.height - 0.5;

    const moveX = percentX * 20;
    const moveY = percentY * 20;

    const rotateY = percentX * 12;
    const rotateX = -percentY * 12;

    bgEl.style.transform = `
      perspective(600px)
      translate(${moveX}px, ${moveY}px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;
  }

  onMouseLeave(): void {
    if (!this.platform.isBrowser()) return;
    const bgEl = this.elRef.nativeElement.querySelector('.card-bg') as HTMLElement;
    bgEl.style.transform = `
      perspective(600px)
      translate(0px, 0px)
      rotateX(0deg)
      rotateY(0deg)
    `;
  }

  get backgroundImage(): Record<string, string> {
    if (!this.card) {
      console.warn('the card is not initialized');
      return {};
    }
    const url = this.card ? `url(${this.getImageUrl(this.card.image_url)})` : '';
    return { 'background-image': `${url}` };
  }

  get insetBorder(): Record<string, string> {
    if (!this.card) {
      console.warn('the card is not initialized');
      return {};
    }
    const inline_color = this.card ? `${this.card.inline_color}` : '';
    return { 'border-color': `${inline_color}` };
  }

  get label(): Record<string, string> {
    if (!this.card) {
      console.warn('the card is not initialized');
      return {};
    }
    const label_color = this.card ? `${this.card.label_color}` : '';
    const text_color = this.card ? `${this.card.text_color}` : '';
    return { 'background-color': `${label_color}`, color: `${text_color}` };
  }

  get text(): Record<string, string> {
    if (!this.card) {
      console.warn('the card is not initialized');
      return {};
    }
    const color = this.card ? `${this.card.text_color}` : '';
    return { color: `${color}` };
  }

  getImageUrl(path: string): string {
    //URL
    return `https://127.0.0.1:8080${path}`;
  }
}
