import {
  NavigationCancel,
  NavigationError,
  NavigationExtras,
  Params,
  RouterStateSnapshot,
  RoutesRecognized
} from '@angular/router';
import { StaticAction } from '@ngxs/store';

/**
 * Public event api of the router
 */
@StaticAction()
export class Navigate {
  static get type() {
    return '[Router] Navigate';
  }
  constructor(
    public path: any[],
    public queryParams?: Params,
    public extras?: NavigationExtras
  ) {}
}

/**
 *
 * Angular Routers internal state events
 *
 */

/**
 * An action dispatched when the router navigates.
 */
@StaticAction()
export class RouterNavigation<T = RouterStateSnapshot> {
  static get type() {
    return '[Router] RouterNavigation';
  }
  constructor(public routerState: T, public event: RoutesRecognized) {}
}

/**
 * An action dispatched when the router cancel navigation.
 */
@StaticAction()
export class RouterCancel<T, V = RouterStateSnapshot> {
  static get type() {
    return '[Router] RouterCancel';
  }
  constructor(public routerState: V, public storeState: T, public event: NavigationCancel) {}
}

/**
 * An action dispatched when the router errors.
 */
@StaticAction()
export class RouterError<T, V = RouterStateSnapshot> {
  static get type() {
    return '[Router] RouterError';
  }
  constructor(public routerState: V, public storeState: T, public event: NavigationError) {}
}

/**
 * An union type of router actions.
 */
export type RouterAction<T, V = RouterStateSnapshot> =
  | RouterNavigation<V>
  | RouterCancel<T, V>
  | RouterError<T, V>;
