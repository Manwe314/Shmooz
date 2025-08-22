import { Injectable } from '@angular/core';

interface JwtPayload {
  exp?: number;
  [k: string]: any;
}

function base64UrlDecode(input: string): string {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4;
  if (pad) input += '===='.slice(pad);
  try {
    return atob(input);
  } catch {
    return '';
  }
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private accessToken: string | null = null;

  setAccessToken(token: string | null): void {
    this.accessToken = token ?? null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  clear(): void {
    this.accessToken = null;
  }

  hasAccessToken(): boolean {
    return !!this.accessToken;
  }

  private getPayload(): JwtPayload | null {
    const t = this.accessToken;
    if (!t) return null;
    const parts = t.split('.');
    if (parts.length < 2) return null;
    try {
      const json = base64UrlDecode(parts[1]);
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }

  getExpiration(): number | null {
    const payload = this.getPayload();
    return payload?.exp ?? null;
  }

  isExpired(skewSeconds = 10): boolean {
    const exp = this.getExpiration();
    if (!exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return exp <= now + skewSeconds;
  }

  isExpiringSoon(seconds = 20): boolean {
    const exp = this.getExpiration();
    if (!exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return exp <= now + seconds;
  }
}
