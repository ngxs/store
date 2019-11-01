import { HRM_RUNTIME } from '../symbols';

declare const window: any;

/**
 * @internal
 */
export function hmrSetReloaded(value: boolean = true): void {
  if (window[HRM_RUNTIME.STATUS]) {
    window[HRM_RUNTIME.STATUS].hmrReloaded = value;
  }
}
