import { HttpClient } from '@angular/common/http';
import { inject,Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

export interface Block {
  id: string;
  backgroundColor: string;
  borderColor: string;
  gridTemplateColumns: string;
  gridTemplateRows: string;
  tag?: string;
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
  margin?: string;
  padding?: string;
}

export interface ImageContent extends BaseContent {
  type: 'image';
  tag?: string;
  url: string;
  alt?: string;
  borderRadius?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  overflow?: 'visible' | 'hidden' | 'scroll';
  width?: string;
  height?: string;
}

export interface TextContent extends BaseContent {
  type: 'text';
  text: string;
  color?: string;
  tag?: 'p' | 'h1' | 'h2' | 'span' | 'div';
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
  fontWeight?: string | number;
  fontFamily?: string;
}

export interface LinkContent extends BaseContent {
  type: 'link';
  url: string;
  text: string;
  iconUrl?: string;
  color?: string;
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  fontSize?: string;
  fontWeight?: string | number;
  fontFamily?: string;
  iconPosition?: 'left' | 'right';
}

export interface PageData {
  content: Block[];
}

@Injectable({
  providedIn: 'root',
})
export class PageService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private content: PageData = { content: [] };

  setContent(data: PageData) {
    this.content = data;
  }

  getContent(): PageData {
    return this.content;
  }

  getPageData(path: string, slug: string, id?: string): Observable<PageData> {
    let endpoint: string;

    if (path === 'page_one') endpoint = this.api.buildUrl(`page1/${slug}`);
    else if (path === 'page_two') endpoint = this.api.buildUrl(`page2/${slug}`);
    else if (path === 'project_page' && id) endpoint = this.api.buildUrl(`project_page/${id}`);
    else endpoint = this.api.buildUrl(`page1/${slug}`);

    return this.http.get<PageData>(endpoint);
  }
}
