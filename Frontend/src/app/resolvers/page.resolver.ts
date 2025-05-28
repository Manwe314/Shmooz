import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { PageService } from '../services/page.service';
import { SlugService } from '../services/slug.service';

@Injectable({ providedIn: 'root' })
export class PageResolver implements Resolve<boolean> {
  constructor(
    private pageService: PageService,
    private slugService: SlugService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    const path = route.url[0]?.path ?? '';
    const id = route.paramMap.get('id') ?? undefined;
    const slug = this.slugService.getCurrentSlug() ?? 'COMPANY';


    return this.pageService.getPageData(path, slug, id).pipe(
      tap(data => this.pageService.setContent(data)),
      map(() => true), 
      catchError(err => {
        console.error('[PageResolver] failed to load page data', err);
        this.pageService.setContent({ blocks: [] });
        return of(true); 
      })
    );
  }
}
