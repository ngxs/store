import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideNgxs } from './store';

export const appConfig = {
  providers: [provideZonelessChangeDetection(), provideRouter([]), provideNgxs()]
};
