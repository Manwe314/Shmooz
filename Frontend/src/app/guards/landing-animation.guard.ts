// landing-animation.guard.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { Observable, of, timeout, catchError } from 'rxjs';
import { TransitionService } from '../services/transition.service';

@Injectable({ providedIn: 'root' })
export class LandingAnimationGuard implements CanActivate {
  constructor(
    private transition: TransitionService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
    if (isPlatformServer(this.platformId)) return of(true);

    const nav = this.router.getCurrentNavigation();

    const isFirstOrRefresh = !nav?.previousNavigation;
    if (isFirstOrRefresh) return of(true);

    return this.transition.waitForUnblock().pipe(
      timeout({ each: 10000 }),
      catchError(() => of(true))
    );
  }
}
