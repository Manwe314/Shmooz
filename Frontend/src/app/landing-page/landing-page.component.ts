import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeckDisplayWheelComponent } from '../deck-display-wheel/deck-display-wheel.component';
import { LandingBackgroundComponent } from '../landing-background/landing-background.component';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, DeckDisplayWheelComponent, LandingBackgroundComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

}
