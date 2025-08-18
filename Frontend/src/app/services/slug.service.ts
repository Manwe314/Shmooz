import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';

interface SlugDto {
  id: number | string;
  slug: string;
  created_at: string;
  edited_at: string;
}

@Injectable({
  providedIn: 'root' 
})
export class SlugService {
  private slugSubject = new BehaviorSubject<string | null>(null);
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private cache$?: Observable<string[]>;

  slug$: Observable<string | null> = this.slugSubject.asObservable().pipe(
    distinctUntilChanged() 
  );

  setSlug(slug: string) 
  {
    this.slugSubject.next(slug);
  }

  getCurrentSlug(): string | null 
  {
    return this.slugSubject.getValue();
  }

  getAllSlugs(): Observable<string[]> {
    if (!this.cache$) {
      const url = this.api.buildUrl('slugs/');
      this.cache$ = this.http.get<SlugDto[]>(url).pipe(
        map((list: SlugDto[]) => list?.map(s => s.slug) ?? []),
        shareReplay(1)
      );
    }
    return this.cache$;
  }
}
