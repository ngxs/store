import { ApplicationConfig } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { appConfig } from './app.config';

// TODO: use `mergeApplicationConfig` in v16.
export const appBrowserConfig: ApplicationConfig = {
  providers: [provideAnimations(), ...appConfig.providers]
};
