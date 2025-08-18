import { Injectable, inject } from '@angular/core';
import { Resolve } from '@angular/router';
import { forkJoin, of, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BackgroundService } from '../services/background.service';
import { SlugService } from '../services/slug.service';
import { PageDetails, PageInfo, GradientColors } from '../services/background.service';
import { TransferState, makeStateKey } from '@angular/core';


type BgPayload = {
  gradient: GradientColors;
  pageNames: PageInfo;
  pageDetails: PageDetails;
};

@Injectable({ providedIn: 'root' })
export class LandingBackgroundResolver implements Resolve<boolean> {
  private ts = inject(TransferState);
  constructor(
    private backgroundService: BackgroundService,
    private slugService: SlugService
  ) {}

  resolve() {
    const slug = this.slugService.getCurrentSlug() ?? 'shmooz';
    const KEY = makeStateKey<any>(`bg:${slug}`);
    
    const cached = this.ts.get(KEY, null as any);
    if (cached) {
      this.backgroundService.setResolvedGradient(cached.gradient);
      this.backgroundService.setResolvedPageNames(cached.pageNames);
      this.backgroundService.setResolvedPageDetails(cached.pageDetails);
      return of(true);
    }
    
    return forkJoin({
      gradient: this.backgroundService.getGradientColors(slug),
      pageNames: this.backgroundService.getPageInfo(slug),
      pageDetails: this.backgroundService.getPageDetails(slug)
    }).pipe(
      tap((payload: BgPayload) => {
        this.backgroundService.setResolvedGradient(payload.gradient);
        this.backgroundService.setResolvedPageNames(payload.pageNames);
        this.backgroundService.setResolvedPageDetails(payload.pageDetails);
        this.ts.set(KEY, payload);
      }),
      map(() => true),
      catchError(err => {
        console.error('[LandingBackgroundResolver] error:', err);
        return of(true);
      })
    );
  }
}
