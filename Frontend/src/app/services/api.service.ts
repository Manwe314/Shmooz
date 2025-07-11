import { Injectable, inject } from '@angular/core';
import { PlatformService } from './platform.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private platform = inject(PlatformService);

  getBaseUrl(): string {
    return this.platform.isServer()
      ? 'http://backend:8000' // container-to-container
      : 'https://127.0.0.1:8080';  // browser to local backend
  }

  buildUrl(endpoint: string): string {
    return `${this.getBaseUrl()}/api/${endpoint}`;
  }
}

