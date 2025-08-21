import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptorsFromDi, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { authInterceptor } from './admin/auth/auth.interceptor';
import { CsrfService } from './admin/auth/csrf.service';
import { firstValueFrom, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation() // ✅ avoids any pre-paint before first route resolves
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi(),
      withInterceptors([authInterceptor]),
      withXsrfConfiguration({ cookieName: 'csrftoken', headerName: 'X-CSRFToken' }),
    ),

    // ✅ Set CSRF cookie before anything else
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const csrf = inject(CsrfService);
        return () =>
          firstValueFrom(
            csrf.ensureCsrfCookie().pipe(
              timeout(2000),          // don't block forever if server is slow
              catchError(() => of(true)) // don't fail boot if it times out
            )
          );
      }
    }
  ],
};
