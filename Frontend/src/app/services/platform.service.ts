import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { DOCUMENT } from '@angular/common';

export interface WindowLike {
  innerWidth: number;
  innerHeight: number;
  scrollX: number;
  scrollY: number;
  requestAnimationFrame(cb: FrameRequestCallback): number;
  cancelAnimationFrame(id: number): void;
  matchMedia(query: string): { matches: boolean };
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private platformId = inject(PLATFORM_ID);
  private readonly _document = inject(DOCUMENT);

  isServer(): boolean {
    return isPlatformServer(this.platformId);
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get windowRef(): WindowLike {
    if (this.isBrowser()) {
      return window as unknown as WindowLike;
    }
    return this.ssrWindowStub;
  }

  get documentRef(): Document | null {
    return this.isBrowser() ? (this._document as Document) : null;
  }

  get viewport(): { width: number; height: number } {
    return {
      width: this.windowRef.innerWidth,
      height: this.windowRef.innerHeight,
    };
  }

  // ---------- Private ----------

  /** No-op SSR window stub so app code can read viewport & attach listeners safely */
  private readonly ssrWindowStub: WindowLike = {
    innerWidth: 1280,
    innerHeight: 800,
    scrollX: 0,
    scrollY: 0,
    requestAnimationFrame: (cb: FrameRequestCallback): number =>
      // simulate ~60fps tick; cast to number for API compatibility
      (setTimeout(() => cb(Date.now()), 16) as unknown as number),
    cancelAnimationFrame: (id: number): void => {
      clearTimeout(id as unknown as NodeJS.Timeout);
    },
    matchMedia: (_q: string) => ({ matches: false }),
    addEventListener: () => { /* no-op on SSR */ },
    removeEventListener: () => { /* no-op on SSR */ },
  };
}

