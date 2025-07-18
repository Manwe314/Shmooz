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

  resetBlock(): void {
    this.unblock$ = new Subject<boolean>();
  }

  createClone(el: HTMLElement): HTMLElement {
    const rect = el.getBoundingClientRect();
    const clone = el.cloneNode(true) as HTMLElement;
    Object.assign(clone.style, {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      zIndex: '9999',
      pointerEvents: 'none',
      margin: '0',
    });
    document.body.appendChild(clone);
    this.activeClone = clone;
    return clone;
  }

  async animateCardToFullscreen(cardEl: HTMLElement): Promise<void> {
    return new Promise(resolve => {
      cardEl.classList.add('expanding');

      requestAnimationFrame(() => {
        cardEl.classList.add('fullscreen');
      });

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
