import { inject,Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { SlugService } from './slug.service';

@Injectable({ providedIn: 'root' })
export class SelectedSlugGuard implements CanActivate {
  private slugs = inject(SlugService);
  private router = inject(Router);

  canActivate(): boolean | UrlTree {
    return this.slugs.selectedSlugSnapshot ? true : this.router.createUrlTree(['/dashboard']);
  }
}
