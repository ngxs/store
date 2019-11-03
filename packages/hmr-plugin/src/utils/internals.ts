import { HMR_RUNTIME } from '../symbols';

declare const window: any;

export function hmrSetReloaded(value: boolean = true): void {
  if (window[HMR_RUNTIME.STATUS]) {
    window[HMR_RUNTIME.STATUS].hmrReloaded = value;
  }
}

export function hmrApplicationMarked(): void {
  window[HMR_RUNTIME.STATUS] = window[HMR_RUNTIME.STATUS] || {
    hmrReloaded: false
  };
}
