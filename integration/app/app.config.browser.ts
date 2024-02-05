import { mergeApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

import { appConfig } from './app.config';

export const appBrowserConfig = mergeApplicationConfig(appConfig, {
  providers: [provideAnimations()]
});
