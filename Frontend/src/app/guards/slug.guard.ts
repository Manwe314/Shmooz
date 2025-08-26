import { inject,Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SlugService } from '../services/slug.service';

const DEFAULT_SLUG = 'shmooz';

@Injectable({ providedIn: 'root' })
export class SlugGuard implements CanActivate {
  private slugs = inject(SlugService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    const paramSlug = route.paramMap.get('slug');
    const querySlug = route.queryParamMap.get('slug');
    const requested = (paramSlug ?? querySlug ?? DEFAULT_SLUG).trim();

    return this.slugs.getAllSlugs().pipe(
      map((allowed: string[]) => {
        const isValid = allowed.includes(requested) || requested === DEFAULT_SLUG;
        if (isValid) return true;

        const [pathOnly, _qs] = state.url.split('?');
        const segments = pathOnly.split('/').filter(Boolean);
        if (segments.length > 0) {
          segments[0] = DEFAULT_SLUG;
        } else {
          segments.push(DEFAULT_SLUG);
        }

        const queryParams = { ...route.queryParams, slug: DEFAULT_SLUG };

        return this.router.createUrlTree(['/', ...segments], {
          queryParams,
          queryParamsHandling: 'merge',
          preserveFragment: true,
        });
      }),
    );
  }
}
