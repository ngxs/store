import { HmrRuntime } from '../symbols';

declare const window: any;

export function isHmrReloaded(): boolean {
  return !!(window[HmrRuntime.Status] && window[HmrRuntime.Status].hmrReloaded);
}
