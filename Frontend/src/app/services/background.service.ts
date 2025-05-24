import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

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
  private api = inject(ApiService);
  
  getGradientColors(path: string = ''): Observable<GradientColors> {
    const endpoint = path ? this.api.buildUrl(`gradient-colors/${path}`) : this.api.buildUrl('gradient-colors/COMPANY');
    return this.http.get<GradientColors>(endpoint);
  }

  getPageInfo(path: string = ''): Observable<PageInfo> {
    const endpoint = path ? this.api.buildUrl(`page-names/${path}`) : this.api.buildUrl('page-names/COMPANY');
    return this.http.get<PageInfo>(endpoint);
  }
}
