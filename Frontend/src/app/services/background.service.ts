import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TransferState, makeStateKey } from '@angular/core';

export interface GradientColors {
  color1: string;
  position1: string;
  color2: string;
  position2: string;
  color3: string;
  position3: string;
}

export interface PageInfo {
  page1: string;
  page2: string;
}

export interface PageDetails {
  navColor: string;
  arrowColor: string;
  ellipseWidth: number;
  ellipseHeight: number;
}

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private ts   = inject(TransferState);
  private gradient: GradientColors | null = null;
  private pageNames: PageInfo | null = null;
  private pageDetails: PageDetails | null = null;

  hydrateFromTransferState(slug: string): void {
    const KEY = makeStateKey<any>(`bg:${slug}`);
    const payload = this.ts.get(KEY, null as any);
    if (payload) {
      this.gradient    = payload.gradient ?? this.gradient;
      this.pageNames   = payload.pageNames ?? this.pageNames;
      this.pageDetails = payload.pageDetails ?? this.pageDetails;
    }
  }
  
  setResolvedGradient(data: GradientColors) {
    this.gradient = data;
  }
  
  getGradient(): GradientColors | null {
    return this.gradient;
  }
  
  setResolvedPageNames(data: PageInfo) {
    this.pageNames = data;
  }
  
  getPageNames(): PageInfo | null {
    return this.pageNames;
  }

  setResolvedPageDetails(data: PageDetails) {
    this.pageDetails = data;
  }

  getPageDetail(): PageDetails | null {
    return this.pageDetails;
  }

  getGradientColors(path: string = ''): Observable<GradientColors> {
    const endpoint = path ? this.api.buildUrl(`gradient-colors/${path}`) : this.api.buildUrl('gradient-colors/shmooz');
    return this.http.get<GradientColors>(endpoint);
  }

  getPageInfo(path: string = ''): Observable<PageInfo> {
    const endpoint = path ? this.api.buildUrl(`page-names/${path}`) : this.api.buildUrl('page-names/shmooz');
    return this.http.get<PageInfo>(endpoint);
  }

  getPageDetails(path: string = ''): Observable<PageDetails> {
    const endpoint = path ? this.api.buildUrl(`page-details/${path}`) : this.api.buildUrl('page-details/shmooz')
    return this.http.get<PageDetails>(endpoint);
  }
}
