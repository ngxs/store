import { ActivatedRouteSnapshot, PRIMARY_OUTLET, RouterStateSnapshot } from '@angular/router';
import { createSelector } from '@ngxs/store';

import { ROUTER_STATE_TOKEN, RouterStateModel } from './router.state';

/**
 * These are exported as standalone tree-shakable selectors, rather than as
 * static members on `RouterState`, because unused static class properties
 * always ship in the bundle — bundlers can't remove individual members off
 * a class that's itself always referenced (as `RouterState` is, via
 * `withNgxsRouterPlugin()`). Plain top-level exports can be shaken.
 */

/**
 * The query params of the current navigation. Unlike `routerParams`/`routerData`/
 * `routerTitle` below, query params are global to the whole navigation, not tied
 * to a specific activated route, so this is always accurate regardless of outlets.
 *
 * Assumes the default `RouterStateSerializer` output shape
 * (`SerializedRouterStateSnapshot`). If you've provided a custom serializer,
 * build your own selector from `RouterState.state()` instead.
 */
export const routerQueryParams = /* @__PURE__ */ createSelector(
  [ROUTER_STATE_TOKEN],
  state => state?.state?.root.queryParams
);

export const routerQueryParamMap = /* @__PURE__ */ createSelector(
  [ROUTER_STATE_TOKEN],
  state => state?.state?.root.queryParamMap
);

export const routerFragment = /* @__PURE__ */ createSelector(
  [ROUTER_STATE_TOKEN],
  state => state?.state?.root.fragment
);

/**
 * The path params of the deepest activated route on the primary outlet —
 * mirrors what `ActivatedRoute.snapshot.params` exposes for the component
 * currently being rendered.
 *
 * Only follows the primary outlet chain, so in an app with simultaneously
 * active named outlets this reflects the primary outlet's branch only.
 * Use `routerParamsForOutlet(outlet)` to read params from a named outlet's branch.
 */
export const routerParams = /* @__PURE__ */ createSelector(
  [ROUTER_STATE_TOKEN],
  state => getActivatedLeafRoute(state)?.params
);

export const routerParamMap = /* @__PURE__ */ createSelector(
  [ROUTER_STATE_TOKEN],
  state => getActivatedLeafRoute(state)?.paramMap
);

/** The `data` of the deepest activated route on the primary outlet. Same named-outlet caveat as `routerParams`. */
export const routerData = /* @__PURE__ */ createSelector(
  [ROUTER_STATE_TOKEN],
  state => getActivatedLeafRoute(state)?.data
);

/** The resolved `title` of the deepest activated route on the primary outlet. Same named-outlet caveat as `routerParams`. */
export const routerTitle = /* @__PURE__ */ createSelector(
  [ROUTER_STATE_TOKEN],
  state => getActivatedLeafRoute(state)?.title
);

/**
 * The path params of the deepest activated route within the given named
 * outlet's branch, e.g. `routerParamsForOutlet('aux')`.
 */
export function routerParamsForOutlet(outlet: string) {
  return createSelector(
    [ROUTER_STATE_TOKEN],
    state => getActivatedLeafRoute(state, outlet)?.params
  );
}

export function routerParamMapForOutlet(outlet: string) {
  return createSelector(
    [ROUTER_STATE_TOKEN],
    state => getActivatedLeafRoute(state, outlet)?.paramMap
  );
}

/** The `data` of the deepest activated route within the given named outlet's branch. */
export function routerDataForOutlet(outlet: string) {
  return createSelector(
    [ROUTER_STATE_TOKEN],
    state => getActivatedLeafRoute(state, outlet)?.data
  );
}

/** The resolved `title` of the deepest activated route within the given named outlet's branch. */
export function routerTitleForOutlet(outlet: string) {
  return createSelector(
    [ROUTER_STATE_TOKEN],
    state => getActivatedLeafRoute(state, outlet)?.title
  );
}

/**
 * Walks down to the deepest activated route within the given outlet's branch.
 * For the primary outlet (the default), this simply follows `firstChild`
 * from the root. For a named outlet, it first locates that outlet's
 * activated route anywhere in the tree, then follows `firstChild` from there.
 */
function getActivatedLeafRoute(
  state: RouterStateModel<RouterStateSnapshot> | undefined,
  outlet: string = PRIMARY_OUTLET
): ActivatedRouteSnapshot | undefined {
  const root = state?.state?.root;
  let route = outlet === PRIMARY_OUTLET ? root : root && findRouteForOutlet(root, outlet);
  while (route?.firstChild) {
    route = route.firstChild;
  }
  return route;
}

/** Depth-first search for the activated route belonging to the given outlet. */
function findRouteForOutlet(
  route: ActivatedRouteSnapshot,
  outlet: string
): ActivatedRouteSnapshot | undefined {
  for (const child of route.children) {
    if (child.outlet === outlet) {
      return child;
    }
    const found = findRouteForOutlet(child, outlet);
    if (found) {
      return found;
    }
  }
  return undefined;
}
