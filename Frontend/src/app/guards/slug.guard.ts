import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SlugService } from '../services/slug.service';

const DEFAULT_SLUG = 'shmooz';

@Injectable({ providedIn: 'root' })
export class SlugGuard implements CanActivate {
    private slugs = inject(SlugService);
    private router = inject(Router);

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        const paramSlug = route.paramMap.get('slug');
        const querySlug = route.queryParamMap.get('slug');
        const requested = (paramSlug ?? querySlug ?? DEFAULT_SLUG).trim();

        return this.slugs.getAllSlugs().pipe(
          map((allowed: string[]) => {
            const isValid = allowed.includes(requested) || requested === DEFAULT_SLUG;
            if (isValid) return true;

            // Build new URL preserving subpath & query params, but fixing slug
            // 1) Split path and replace first segment if we have a :slug param route
            const [pathOnly, qs] = state.url.split('?');
            const segments = pathOnly.split('/').filter(Boolean);
            if (segments.length > 0) {
              // assume :slug is first segment
              segments[0] = DEFAULT_SLUG;
            } else {
              segments.push(DEFAULT_SLUG);
            }

            // 2) Merge query params and ensure ?slug=DEFAULT_SLUG for query-based consumers
            const queryParams = { ...route.queryParams, slug: DEFAULT_SLUG };

            return this.router.createUrlTree(['/', ...segments], {
              queryParams,
              queryParamsHandling: 'merge',
              preserveFragment: true,
            });
          })
        );
    }
}
