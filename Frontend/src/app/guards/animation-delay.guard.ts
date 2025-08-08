import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { Observable, of, timeout, catchError } from 'rxjs';
import { TransitionService } from '../services/transition.service';

@Injectable({ providedIn: 'root' })
export class AnimationDelayGuard implements CanActivate {
  constructor(
    private transitionService: TransitionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): Observable<boolean> {
    // During SSR/prerender, never block
    if (isPlatformServer(this.platformId)) return of(true);

    // In browser, wait, but don't hang forever
    return this.transitionService.waitForUnblock().pipe(
      timeout({ each: 10000 }),        // safety timeout
      catchError(() => of(true))      // fail-open if something goes wrong
    );
  }
}

