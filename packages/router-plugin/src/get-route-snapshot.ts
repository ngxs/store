import { Type } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { createSelector } from '@ngxs/store';

import { RouterState, RouterStateModel } from './router.state';

export function getRouteSnapshot<T>(component: Type<T>) {
  return createSelector<(state: RouterStateModel) => null | ActivatedRouteSnapshot>(
    [RouterState],
    (state: RouterStateModel) => searchRoute(state, component)
  );
}

function searchRoute<T>(state: RouterStateModel, component: Type<T>) {
  // If the selector was invoked before initial navigation
  if (!state || !state.state) {
    return null;
  }

  const root = state.state.root;

  // If the root component was requested
  if (root.component === component) {
    return root;
  }

  return searchRouteAmongChildren<T>(root, component);
}

function searchRouteAmongChildren<T>(
  parent: ActivatedRouteSnapshot,
  component: Type<T>
): ActivatedRouteSnapshot | null {
  let i = parent.children.length;

  while (i--) {
    const child = parent.children[i];

    if (child.component === component) {
      return child;
    }

    return searchRouteAmongChildren<T>(child, component);
  }

  return null;
}
