import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate } from '@angular/router';
import { catchError,Observable, of, timeout } from 'rxjs';

import { TransitionService } from '../services/transition.service';

@Injectable({ providedIn: 'root' })
export class AnimationDelayGuard implements CanActivate {
  constructor(
    private transitionService: TransitionService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  canActivate(): Observable<boolean> {
    if (isPlatformServer(this.platformId)) return of(true);

    return this.transitionService.waitForUnblock().pipe(
      timeout({ each: 10000 }),
      catchError(() => of(true)),
    );
  }
}
