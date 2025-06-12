import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Block {
  id: string;
  backgroundColor: string; // rgba(0,0,0,0.1)
  borderColor: string;
  gridTemplateColumns: string; // e.g. '1fr 2fr 1fr'
  gridTemplateRows: string;    // e.g. 'auto auto'
  content: BlockContent[];
}

export type BlockContent = ImageContent | TextContent | LinkContent;

export interface BaseContent {
  id: string;
  type: 'image' | 'text' | 'link';
  rowStart: number;
  colStart: number;
  rowSpan?: number;
  colSpan?: number;
}

export interface ImageContent extends BaseContent {
  type: 'image';
  url: string;
  alt?: string;
  borderRadius?: string;
}

export interface TextContent extends BaseContent {
  type: 'text';
  text: string;
  color?: string;
  tag?: 'p' | 'h1' | 'h2' | 'span' | 'div';
  textAlign?: 'left' | 'center' | 'right';
}

export interface LinkContent extends BaseContent {
  type: 'link';
  url: string;
  text: string;
  iconUrl?: string;
}


export interface PageData {
  content: Block[];
}

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private content: PageData = {content: []};

  setContent(data: PageData) {
    this.content = data;
  }

  getContent(): PageData {
    return this.content;
  }

  getPageData(path: string, slug: string, id?: string): Observable<PageData> {
    let endpoint: string;

    //to-do mc givi pagination

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
