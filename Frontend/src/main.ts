import { ApplicationRef } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { filter, take } from 'rxjs/operators';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).then((ref) => {
  const appRef = ref.injector.get(ApplicationRef);

  appRef.isStable
    .pipe(
      filter((s) => s),
      take(1),
    )
    .subscribe(() => {
      requestAnimationFrame(() => {
        document.body.classList.remove('initial-no-fade');
      });
    });
});
