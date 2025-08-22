import { HttpClient } from '@angular/common/http';
import { inject,Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';

export interface ImageDto {
  id: number;
  title: string;
  image: string;
  uploaded_at: string;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class ImageService {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  listImages(limit = 40, offset = 0, ordering = '-uploaded_at'): Observable<Page<ImageDto>> {
    const url = this.api.buildUrl(
      `images/?limit=${limit}&offset=${offset}&ordering=${encodeURIComponent(ordering)}`,
    );
    return this.http.get<Page<ImageDto>>(url).pipe(
      catchError((err) => {
        console.error('List images failed', err);
        return of({ count: 0, next: null, previous: null, results: [] });
      }),
    );
  }

  uploadImage(ownerSlug: string, title: string, file: File): Observable<ImageDto | null> {
    const url = this.api.buildUrl(`upload-image/${encodeURIComponent(ownerSlug)}`);
    const form = new FormData();
    form.append('title', title);
    form.append('image', file);
    return this.http.post<ImageDto>(url, form).pipe(
      catchError((err) => {
        console.error('Upload image failed', err);
        return of(null);
      }),
    );
  }
}
