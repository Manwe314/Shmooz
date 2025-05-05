import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' 
})
export class SlugService {
  private slugSubject = new BehaviorSubject<string | null>(null);

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
}
