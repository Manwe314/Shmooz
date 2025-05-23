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

export interface PageInfo {
  page1: string;
  page2: string;
}

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  private http = inject(HttpClient);
  
  getGradientColors(path: string = ''): Observable<GradientColors> {
    const endpoint = path ? `http://backend:8000/api/gradient-colors/${path}` : 'http://backend:8000/api/gradient-colors/';
    return this.http.get<GradientColors>(endpoint);
  }

  getPageInfo(path: string = ''): Observable<PageInfo> {
    const endpoint = path ? `http://backend:8000/api/page-names/${path}` : 'http://backend:8000/api/page-names/';
    return this.http.get<PageInfo>(endpoint);
  }
}
