import { HmrRuntime } from '../symbols';

declare const window: any;

export function setHmrReloadedTo(value = true): void {
  if (window[HmrRuntime.Status]) {
    window[HmrRuntime.Status].hmrReloaded = value;
  }
}

export function markApplicationAsHmrReloaded(): void {
  window[HmrRuntime.Status] = window[HmrRuntime.Status] || {
    hmrReloaded: false
  };
}
