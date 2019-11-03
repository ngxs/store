import { HMR_RUNTIME } from '../symbols';

declare const window: any;

export function hmrIsReloaded(): boolean {
  return !!(window[HMR_RUNTIME.STATUS] && window[HMR_RUNTIME.STATUS].hmrReloaded);
}
