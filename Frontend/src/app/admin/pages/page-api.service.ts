import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { catchError, map, of } from 'rxjs';

export type PageCategory = 'page_one' | 'page_two' | `project_${number}`;

export interface PageRecordDto {
  id: number;
  owner: string;
  category: string;
  content: string; // JSON string from backend
  created_at: string;
  edited_at: string | null;
}

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

export interface PageData { content: Block[] }

@Injectable({ providedIn: 'root' })
export class AdminPageApiService {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  // Top-level pages
  getNavPage(ownerSlug: string, category: 'page_one' | 'page_two') {
    // Your docs show /page1/{slug} and /page2/{slug}. Map category to endpoint:
    const endpoint = category === 'page_one' ? 'page1' : 'page2';
    const url = this.api.buildUrl(`${endpoint}/${encodeURIComponent(ownerSlug)}`);
    return this.http.get<PageRecordDto>(url).pipe(
      catchError(err => {
        if (err?.status === 404) return of(null);
        console.error('Get nav page failed', err);
        return of(null);
      })
    );
  }

  // Project page by project card id
  getProjectPage(projectId: number) {
    const url = this.api.buildUrl(`project_page/${projectId}`);
    return this.http.get<PageRecordDto>(url).pipe(
      catchError(err => {
        if (err?.status === 404) return of(null);
        console.error('Get project page failed', err);
        return of(null);
      })
    );
  }

  // Create/Update (upsert by owner+category unique)
    uploadPage(owner: string, category: string, content: any[], projectCardId?: number) {
      const url = this.api.buildUrl(`auth/upload_page/`);
      const body: any = {
        owner,
        category,
        content,              // ✅ array, not object
        ...(projectCardId ? { project_card_id: projectCardId } : {})
      };
      return this.http.post<PageRecordDto>(url, body);
    }
    
    updatePage(
      id: number,
      body: {
        owner?: string;
        category?: string;
        content?: any[];       // ✅ array
        project_card_id?: number;
      }
    ) {
      const url = this.api.buildUrl(`auth/alter_page/${id}`);
      return this.http.put<PageRecordDto>(url, body);
    }
    
    deletePage(id: number) {
      const url = this.api.buildUrl(`auth/alter_page/${id}`);
      return this.http.delete<void>(url); // <-- no catchError
    }
}
