import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideNgxs } from './store';

export const appConfig = {
  providers: [provideExperimentalZonelessChangeDetection(), provideRouter([]), provideNgxs()]
};
