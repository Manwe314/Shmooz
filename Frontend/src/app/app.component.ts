import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LandingBackgroundComponent } from './landing-background/landing-background.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LandingBackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
