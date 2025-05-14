import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GradientColors {
  color1: string;
  position1: number;
  color2: string;
  position2: number;
  color3: string;
  position3: number;
}

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  private http = inject(HttpClient);

  getGradientColors(path: string = ''): Observable<GradientColors> {
    const endpoint = path ? `https://127.0.0.1/api/gradient-colors/${path}` : 'https://127.0.0.1/api/gradient-colors/';
    return this.http.get<GradientColors>(endpoint);
  }
}
