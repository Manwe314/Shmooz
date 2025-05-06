import { filter } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { SlugService } from './services/slug.service';
import { LandingBackgroundComponent } from './landing-background/landing-background.component';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DeckDisplayWheelComponent } from './deck-display-wheel/deck-display-wheel.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LandingBackgroundComponent, DeckDisplayWheelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'Shmoozers';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private slugService: SlugService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        let currentRoute = this.route;
        while (currentRoute.firstChild) {
          currentRoute = currentRoute.firstChild;
        }

        const slug = currentRoute.snapshot.paramMap.get('slug') || '';
        this.slugService.setSlug(slug);
      });
  }
}
