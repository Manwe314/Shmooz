import { Injectable } from '@angular/core';
import { Subject, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransitionService {
  private activeClone?: HTMLElement;
  private unblock$ = new Subject<boolean>();

  waitForUnblock(): Observable<boolean> {
    return this.unblock$.asObservable().pipe(take(1));
  }

  /** Called after animation finishes */
  unblockRoute(): void {
    this.unblock$.next(true);
  }

  blockNavigation(): void {
    this.unblock$ = new Subject<boolean>();
  }

  resetBlock(): void {
    this.unblock$ = new Subject<boolean>();
  }

  createClone(el: HTMLElement): HTMLElement {
  const clone = el.cloneNode(true) as HTMLElement;

  // Remove unwanted animation class if present
  clone.classList.remove('hand-card');
  clone.classList.add('hand-card-clone'); // Your own base class

  // Copy computed position and size
  const rect = el.getBoundingClientRect();
  
  Object.assign(clone.style, {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: '0',
    transform: 'none',
    zIndex: '9999',
    pointerEvents: 'none'
  });

  document.body.appendChild(clone);
  this.activeClone = clone;
  return clone;
  }

  async animateCardToFullscreen(cardEl: HTMLElement): Promise<void> {
    return new Promise(resolve => {
    const targetW = window.innerWidth;
    const targetH = window.innerHeight;

    const rect = cardEl.getBoundingClientRect();

    // Compute scale to fill screen
    const scaleX = targetW / rect.width;
    const scaleY = targetH / rect.height;

    // Compute translation to keep center anchored
    const translateX = (targetW / 2 - (rect.left + rect.width / 2)) / scaleX;
    const translateY = (targetH / 2 - (rect.top + rect.height / 2)) / scaleY;

    // Set CSS vars to use in transform
    cardEl.style.setProperty('--scale-x', scaleX.toString());
    cardEl.style.setProperty('--scale-y', scaleY.toString());
    cardEl.style.setProperty('--translate-x', `${translateX}px`);
    cardEl.style.setProperty('--translate-y', `${translateY}px`);

    // Trigger transition
    
    cardEl.classList.add('fullscreen');

    // Resolve after transition
    setTimeout(() => {
      resolve();
    }, 180000);
  });
  }

  cleanup(): void {
    if (this.activeClone) {
      this.activeClone.remove();
      this.activeClone = undefined;
    }
  }
}
