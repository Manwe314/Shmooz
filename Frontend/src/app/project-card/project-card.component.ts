import { Component, Input } from '@angular/core';
import { ProjectCard } from '../services/project-cards.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-card',
  imports: [CommonModule],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent {
  @Input() card!: ProjectCard;

  get backgroundImage(): Record<string, string> {
    if (!this.card){
      console.warn('the card is not initialized');
      return {};
    }
    const url = this.card ? `url(${this.getImageUrl(this.card.image_url)})` : '';
    return {'background-image': `${url}`};
  }

  get insetBorder(): Record<string, string> {
    if (!this.card){
      console.warn('the card is not initialized');
      return {};
    }
    const inline_color = this.card ? `${this.card.inline_color}` : '';
    return  {'border-color': `#${inline_color}`};
  }

  get label(): Record<string, string> {
    if (!this.card){
      console.warn('the card is not initialized');
      return {};
    }
    const label_color = this.card ? `${this.card.label_color}` : '';
    const text_color = this.card ? `${this.card.text_color}` : '';
    return {'background-color': `#${label_color}`, 'color': `#${text_color}`};
  }

  get text(): Record<string, string> {
    if (!this.card){
      console.warn('the card is not initialized');
      return {};
    }
    const color = this.card ? `${this.card.text_color}` : '';
    return {'color': `#${color}`};
  }


  getImageUrl(path: string): string {
    return `https://127.0.0.1${path}`
  }

}
