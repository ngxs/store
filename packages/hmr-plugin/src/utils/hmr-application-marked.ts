import { HRM_RUNTIME } from '../symbols';

declare const window: any;

/**
 * @internal
 */
export function hmrApplicationMarked(): void {
  window[HRM_RUNTIME.STATUS] = window[HRM_RUNTIME.STATUS] || {
    hmrReloaded: false
  };
}
