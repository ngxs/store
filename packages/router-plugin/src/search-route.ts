import { Type } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { RouterStateModel } from './router.state';

export function searchRoute<T>(
  { state }: RouterStateModel,
  component: Type<T> | null
): ActivatedRouteSnapshot | null {
  // If the selector was invoked before the module was initialized
  if (!state || !state.root) {
    return null;
  }

  const root = state.root;

  // Root snapshot's `component` property equals `null`
  if (component === null) {
    return root;
  }

  return searchRouteAmongChildren<T>(root, component);
}

function searchRouteAmongChildren<T>(
  parent: ActivatedRouteSnapshot,
  component: Type<T>
): ActivatedRouteSnapshot | null {
  if (parent.component === component) {
    return parent;
  }

  for (const child of parent.children) {
    const snapshot = searchRouteAmongChildren(child, component);

    if (snapshot) {
      return snapshot;
    }
  }

  return null;
}
