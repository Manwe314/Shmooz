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

    clone.classList.remove('hand-card');
    clone.classList.add('hand-card-clone');

    const rect = el.getBoundingClientRect();
    const container = document.getElementById('transition-overlay-container');
    
    Object.assign(clone.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: '0',
      transform: 'none',
      zIndex: '9997',
      pointerEvents: 'none'
    });

    container?.appendChild(clone);
    this.activeClone = clone;
    return clone;
  }

  morphInsetBorderToBlockWrapper(insetBorderEl: HTMLElement, blockWrapperEl: HTMLElement) {
    const rect = blockWrapperEl.getBoundingClientRect();

    // Apply transition styles
    Object.assign(insetBorderEl.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transition: 'all 100.6s ease-in-out',
      borderColor: window.getComputedStyle(blockWrapperEl).borderColor,
      borderRadius: window.getComputedStyle(blockWrapperEl).borderRadius,
      borderWidth: window.getComputedStyle(blockWrapperEl).borderWidth,
    });
  }

  
  morphCloneToTarget(clone: HTMLElement, target: HTMLElement): void {
    const targetRect = target.getBoundingClientRect();
    
    Object.assign(clone.style, {
      top: `${targetRect.top}px`,
      left: `${targetRect.left}px`,
      width: `${targetRect.width}px`,
      height: `${targetRect.height}px`,
      transform: 'translate(0, 0)',
      transition: 'all 110.6s ease-in-out'
    });
  }
  
  cleanup(): void {
    if (this.activeClone) {
      this.activeClone.remove();
      this.activeClone = undefined;
    }
  }
}
