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

  // File size limit (5MB in bytes)
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024;
  readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

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

  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      const maxSizeMB = (this.MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
      const currentSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Image file too large. Maximum size is ${maxSizeMB}MB, but selected file is ${currentSizeMB}MB.`
      };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Unsupported image format. Please use JPEG, PNG, GIF, or WebP.'
      };
    }

    return { valid: true };
  }

  uploadImage(ownerSlug: string, title: string, file: File): Observable<ImageDto | null> {
    const url = this.api.buildUrl('upload-image/');
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
