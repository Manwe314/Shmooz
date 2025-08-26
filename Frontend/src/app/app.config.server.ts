import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig,mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter } from '@angular/router';

import { appConfig } from './app.config';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideHttpClient(),
    environment.production
      ? provideRouter(routes)
      : provideRouter(routes),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
