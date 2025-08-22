import { inject,Injectable } from '@angular/core';

import { PlatformService } from './platform.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private platform = inject(PlatformService);

  getBaseUrl(): string {
    return this.platform.isServer()
      ? 'http://backend:8000'
      : 'https://127.0.0.1:8080';
  }

  buildUrl(endpoint: string): string {
    return `${this.getBaseUrl()}/api/${endpoint}`;
  }
}
