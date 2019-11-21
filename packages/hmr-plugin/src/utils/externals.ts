import { HmrRuntime } from '../symbols';

declare const window: any;

export function hmrIsReloaded(): boolean {
  return !!(window[HmrRuntime.Status] && window[HmrRuntime.Status].hmrReloaded);
}
