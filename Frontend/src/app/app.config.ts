import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
  withXsrfConfiguration,
} from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { authInterceptor } from './admin/auth/auth.interceptor';
import { CsrfService } from './admin/auth/csrf.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi(),
      withInterceptors([authInterceptor]),
      withXsrfConfiguration({ cookieName: 'csrftoken', headerName: 'X-CSRFToken' }),
    ),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const csrf = inject(CsrfService);
        return () =>
          firstValueFrom(
            csrf.ensureCsrfCookie().pipe(
              timeout(2000),
              catchError(() => of(true)),
            ),
          );
      },
    },
  ],
};
