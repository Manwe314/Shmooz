import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private platformId = inject(PLATFORM_ID);

  isServer(): boolean {
    return isPlatformServer(this.platformId);
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

