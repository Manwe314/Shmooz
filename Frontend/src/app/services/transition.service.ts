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
  
  // createFullscreenClone(el: HTMLElement, className: string): HTMLElement {
  //   const rect = el.getBoundingClientRect();
  //   const clone = el.cloneNode(true) as HTMLElement;

  //   Object.assign(clone.style, {
  //     position: 'fixed',
  //     top: '50%',
  //     left: '50%',
  //     width: '100vw',
  //     height: '100vh',
  //     margin: '0',
  //     zIndex: '9998',
  //     pointerEvents: 'none',
  //     opacity: '0',
  //     overflow: 'hidden', // 💡 Prevent overflow
  //     transform: 'translate(-50%, -50%)',
  //     transition: 'opacity 10.6s ease'
  //   });

  //   clone.classList.add('page-element-clone', className);
  //   return clone;
  // }
  // async animateCardToFullscreen(cardEl: HTMLElement): Promise<void> {
  //   return new Promise(resolve => {
  //   const targetW = window.innerWidth;
  //   const targetH = window.innerHeight;

  //   const rect = cardEl.getBoundingClientRect();

  //   // Compute scale to fill screen
  //   const scaleX = targetW / rect.width;
  //   const scaleY = targetH / rect.height;

  //   // Compute translation to keep center anchored
  //   const translateX = (targetW / 2 - (rect.left + rect.width / 2)) / scaleX;
  //   const translateY = (targetH / 2 - (rect.top + rect.height / 2)) / scaleY;

  //   // Set CSS vars to use in transform
  //   cardEl.style.setProperty('--scale-x', scaleX.toString());
  //   cardEl.style.setProperty('--scale-y', scaleY.toString());
  //   cardEl.style.setProperty('--translate-x', `${translateX}px`);
  //   cardEl.style.setProperty('--translate-y', `${translateY}px`);

  //   // Trigger transition
    
  //   cardEl.classList.add('fullscreen');

  //   // Resolve after transition
  //   setTimeout(() => {
  //     resolve();
  //   }, 180000);
  // });
  // }

  cleanup(): void {
    if (this.activeClone) {
      this.activeClone.remove();
      this.activeClone = undefined;
    }
  }
}
