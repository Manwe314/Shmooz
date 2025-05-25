import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PageData {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private content: PageData = {"message": "Loading..."};

  setContent(data: PageData) {
    this.content = data;
  }

  getContent(): PageData {
    return this.content;
  }

  getPageData(path: string, slug: string, id?: string): Observable<PageData> {
    let endpoint: string;

    if (path === 'page_one') 
      endpoint = this.api.buildUrl(`page1/${slug}`);
    else if (path === 'page_two')
      endpoint = this.api.buildUrl(`page2/${slug}`);
    else if (path === 'project_page' && id)
      endpoint = this.api.buildUrl(`project_page/${id}`);
    else
      endpoint = this.api.buildUrl(`page1/${slug}`);

    return this.http.get<PageData>(endpoint);
  }
  
}
