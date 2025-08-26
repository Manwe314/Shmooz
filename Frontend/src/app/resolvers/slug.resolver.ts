import { inject,Injectable } from '@angular/core';
import { ActivatedRouteSnapshot,Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

import { SlugService } from '../services/slug.service';

const DEFAULT_SLUG = 'shmooz';

@Injectable({ providedIn: 'root' })
export class SlugResolver implements Resolve<boolean> {
  private slugService = inject(SlugService);

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    const slug = route.paramMap.get('slug') ?? route.queryParamMap.get('slug') ?? DEFAULT_SLUG;

    this.slugService.setSlug(slug);
    return of(true);
  }
}
