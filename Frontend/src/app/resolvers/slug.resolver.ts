import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { SlugService } from '../services/slug.service';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SlugResolver implements Resolve<boolean> {
  constructor(private slugService: SlugService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    const slug = route.paramMap.get('slug') ?? 'COMPANY';
    this.slugService.setSlug(slug);
    return of(true);
  }
}

