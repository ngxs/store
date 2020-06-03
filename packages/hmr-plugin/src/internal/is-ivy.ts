import { isDevMode } from '@angular/core';

export function isIvy(): boolean {
  const ng = (window as any).ng || {};
  const _viewEngineEnabled = !!ng.probe && !!ng.coreTokens;
  return !_viewEngineEnabled && isDevMode();
}
