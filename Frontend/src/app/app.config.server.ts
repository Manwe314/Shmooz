import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig,mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter, withDebugTracing } from '@angular/router';

import { appConfig } from './app.config';
import { routes } from './app.routes';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideHttpClient(),
    provideRouter(routes, withDebugTracing()),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
