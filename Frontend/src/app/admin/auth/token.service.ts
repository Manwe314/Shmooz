import { Injectable } from '@angular/core';

interface JwtPayload { exp?: number; [k: string]: any; }

@Injectable({ providedIn: 'root' })
export class TokenService {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) { this.accessToken = token; }
  getAccessToken(): string | null { return this.accessToken; }
  clear() { this.accessToken = null; }

  isExpired(skewSeconds = 10): boolean {
    const t = this.accessToken;
    if (!t) return true;
    try {
      const payload = JSON.parse(atob(t.split('.')[1])) as JwtPayload;
      if (!payload?.exp) return true;
      const now = Math.floor(Date.now() / 1000);
      return payload.exp <= (now + skewSeconds);
    } catch {
      return true;
    }
  }

  isExpiringSoon(seconds = 20): boolean { return this.isExpired(seconds); }
}
