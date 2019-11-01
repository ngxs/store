import { HRM_RUNTIME } from '../symbols';

declare const window: any;

/**
 * @public
 */
export function hrmIsReloaded(): boolean {
  return !!(window[HRM_RUNTIME.STATUS] && window[HRM_RUNTIME.STATUS].hmrReloaded);
}
