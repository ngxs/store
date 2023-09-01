import { ApplicationConfig } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { appConfig } from './app.config';

// TODO: use `mergeApplicationConfig` in v16.
export const appServerConfig: ApplicationConfig = {
  providers: [provideNoopAnimations(), ...appConfig.providers]
};
