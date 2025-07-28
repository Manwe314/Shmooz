// animation-delay.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { TransitionService } from '../services/transition.service';

@Injectable({ providedIn: 'root' })
export class AnimationDelayGuard implements CanActivate {
  constructor(private transitionService: TransitionService) {}

  canActivate(): Observable<boolean> {
    return this.transitionService.waitForUnblock();
  }
}
