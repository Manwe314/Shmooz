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
  clone.classList.remove('playing');
  clone.classList.remove('hand-card');
  clone.classList.add('hand-card-clone'); // Your own base class

  // Copy computed position and size
  const rect = el.getBoundingClientRect();
  const originalTransform = getComputedStyle(el).transform;
  
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
  clone.style.transform = originalTransform;

  document.body.appendChild(clone);
  this.activeClone = clone;
  return clone;
  }

  async animateCardToFullscreen(cardEl: HTMLElement): Promise<void> {
    return new Promise(resolve => {
      // cardEl.classList.add('expanding');

      // requestAnimationFrame(() => {
      //   setTimeout(() => {
      //     cardEl.classList.add('fullscreen');
      //   }, 16);
      // });

      setTimeout(() => {
        resolve();
      }, 100000);  
    });
  }

  cleanup(): void {
    if (this.activeClone) {
      this.activeClone.remove();
      this.activeClone = undefined;
    }
  }
}
