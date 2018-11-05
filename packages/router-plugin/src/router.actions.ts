import {
  NavigationCancel,
  NavigationError,
  NavigationExtras,
  Params,
  RouterStateSnapshot,
  RoutesRecognized
} from '@angular/router';

/**
 * Public event api of the router
 */
export class Navigate {
  static get type() {
    return '[Router] Navigate';
  }
  constructor(public path: any[], public queryParams?: Params, public extras?: NavigationExtras) {}
}

/**
 *
 * Angular Routers internal state events
 *
 */

/**
 * An action dispatched when the router navigates.
 */
export class RouterNavigation<T = RouterStateSnapshot> {
  static get type() {
    return '[Router] RouterNavigation';
  }
  constructor(public routerState: T, public event: RoutesRecognized) {}
}

/**
 * An action dispatched when the router cancel navigation.
 */
export class RouterCancel<T, V = RouterStateSnapshot> {
  static get type() {
    return '[Router] RouterCancel';
  }
  constructor(public routerState: V, public storeState: T, public event: NavigationCancel) {}
}

/**
 * An action dispatched when the router errors.
 */
export class RouterError<T, V = RouterStateSnapshot> {
  static get type() {
    return '[Router] RouterError';
  }
  constructor(public routerState: V, public storeState: T, public event: NavigationError) {}
}

/**
 * An union type of router actions.
 */
export type RouterAction<T, V = RouterStateSnapshot> = RouterNavigation<V> | RouterCancel<T, V> | RouterError<T, V>;
