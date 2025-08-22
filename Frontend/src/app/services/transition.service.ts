import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransitionService {
  private activeClone?: HTMLElement;
  private gate$ = new BehaviorSubject<boolean>(true);

  waitForUnblock(): Observable<boolean> {
    return this.gate$.pipe(
      filter((v: boolean) => v === true),
      take(1),
    );
  }

  unblockRoute(): void {
    this.gate$.next(true);
  }

  blockNavigation(): void {
    this.gate$.next(false);
  }

  get isBlocked(): boolean {
    return this.gate$.getValue() === false;
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
      pointerEvents: 'none',
    });

    container?.appendChild(clone);
    this.activeClone = clone;
    return clone;
  }

  cloneGradient(el: HTMLElement): HTMLElement {
    const container = document.getElementById('transition-overlay-container');
    const clone = el.cloneNode(false) as HTMLElement;
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);

    const c1 = cs.getPropertyValue('--c1').trim();
    const c2 = cs.getPropertyValue('--c2').trim();
    const c3 = cs.getPropertyValue('--c3').trim();
    const p1 = cs.getPropertyValue('--p1').trim();
    const p2 = cs.getPropertyValue('--p2').trim();
    const p3 = cs.getPropertyValue('--p3').trim();

    clone.classList.remove('background');
    clone.classList.add('background-clone');

    const c2a = this.toRgba(c2, 0.4);
    const c3a = this.toRgba(c3, 0.2);

    Object.assign(clone.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transition: 'opacity 1s cubic-bezier(0,-0.21,0,.41)',
      opacity: '0',
      zIndex: '100000',
      pointerEvents: 'none',
    } as CSSStyleDeclaration);

    clone.style.setProperty('--clone-c1', c1);
    clone.style.setProperty('--clone-c2', c2a);
    clone.style.setProperty('--clone-c3', c3a);
    clone.style.setProperty('--clone-p1', p1);
    clone.style.setProperty('--clone-p2', p2);
    clone.style.setProperty('--clone-p3', p3);
    clone.style.setProperty('--clone-y', '250%');

    clone.style.backgroundImage = `
      radial-gradient(
        circle at 50% var(--clone-y),
        var(--clone-c1) var(--clone-p1),
        var(--clone-c2) var(--clone-p2),
        var(--clone-c3) var(--clone-p3)
      )
    `;
    clone.style.backgroundRepeat = 'no-repeat';
    clone.style.backgroundSize = '100% 100%';
    clone.style.backgroundPosition = '50% 50%';

    container?.appendChild(clone);
    this.activeClone = clone;
    return clone;
  }

  morphInsetBorderToBlockWrapper(insetBorderEl: HTMLElement, blockWrapperEl: HTMLElement) {
    const rect = blockWrapperEl.getBoundingClientRect();

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
      transition: 'all 110.6s ease-in-out',
    });
  }

  toRgba(input: string, alpha: number): string {
    const hex = input.trim();

    if (hex.startsWith('rgba')) {
      return hex.replace(/rgba\(([^)]+)\)/, (_, inner) => {
        const parts = inner.split(',').map((s: string) => s.trim());
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
      });
    }
    if (hex.startsWith('rgb(')) {
      return hex.replace(/rgb\(([^)]+)\)/, (_, inner) => `rgba(${inner}, ${alpha})`);
    }

    const clean = hex.replace('#', '');
    let r: number, g: number, b: number;
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16);
      g = parseInt(clean[1] + clean[1], 16);
      b = parseInt(clean[2] + clean[2], 16);
    } else {
      r = parseInt(clean.slice(0, 2), 16);
      g = parseInt(clean.slice(2, 4), 16);
      b = parseInt(clean.slice(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  cleanup(): void {
    if (this.activeClone) {
      this.activeClone.remove();
      this.activeClone = undefined;
    }
  }
}
