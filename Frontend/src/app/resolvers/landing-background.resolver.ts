import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BackgroundService } from '../services/background.service';
import { SlugService } from '../services/slug.service';

@Injectable({ providedIn: 'root' })
export class LandingBackgroundResolver implements Resolve<boolean> {
  constructor(
    private backgroundService: BackgroundService,
    private slugService: SlugService
  ) {}

  resolve() {
    const slug = this.slugService.getCurrentSlug() ?? 'COMPANY';

    return forkJoin({
      gradient: this.backgroundService.getGradientColors(slug),
      pageNames: this.backgroundService.getPageInfo(slug)
    }).pipe(
      map(({ gradient, pageNames }) => {
        this.backgroundService.setResolvedGradient(gradient);
        this.backgroundService.setResolvedPageNames(pageNames);
        return true;
      }),
      catchError(err => {
        console.error('[LandingBackgroundResolver] error:', err);
        return of(true);
      })
    );
  }
}
