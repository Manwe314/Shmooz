import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ApplicationRef } from '@angular/core';
import { filter, take } from 'rxjs/operators';

bootstrapApplication(AppComponent, appConfig).then(ref => {
  const appRef = ref.injector.get(ApplicationRef);

  appRef.isStable.pipe(
    filter(s => s),
    take(1)
  ).subscribe(() => {
    // next frame → allow transitions for later navigations
    requestAnimationFrame(() => {
      document.body.classList.remove('initial-no-fade');
    });
  });
});