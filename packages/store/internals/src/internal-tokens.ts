import { InjectionToken } from '@angular/core';

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

// These tokens are internal and can change at any point.

export const ɵNGXS_STATE_FACTORY = new InjectionToken<any>(
  NG_DEV_MODE ? 'ɵNGXS_STATE_FACTORY' : ''
);

export const ɵNGXS_STATE_CONTEXT_FACTORY = new InjectionToken<any>(
  NG_DEV_MODE ? 'ɵNGXS_STATE_CONTEXT_FACTORY' : ''
);
