import {
  NavigationCancel,
  NavigationError,
  NavigationExtras,
  Params,
  RouterStateSnapshot,
  RoutesRecognized,
  ResolveEnd,
  NavigationStart,
  NavigationEnd
} from '@angular/router';

import { RouterTrigger } from './router.state';

/**
 * Public event api of the router
 */
export class Navigate {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
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
 * An action dispatched when the router starts the navigation.
 */
export class RouterRequest<T = RouterStateSnapshot> {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Router] RouterRequest';
  }
  constructor(
    public routerState: T,
    public event: NavigationStart,
    public trigger: RouterTrigger = 'none'
  ) {}
}

/**
 * An action dispatched when the router navigates.
 */
export class RouterNavigation<T = RouterStateSnapshot> {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Router] RouterNavigation';
  }
  constructor(
    public routerState: T,
    public event: RoutesRecognized,
    public trigger: RouterTrigger = 'none'
  ) {}
}

/**
 * An action dispatched when the router cancel navigation.
 */
export class RouterCancel<T, V = RouterStateSnapshot> {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Router] RouterCancel';
  }
  constructor(
    public routerState: V,
    public storeState: T,
    public event: NavigationCancel,
    public trigger: RouterTrigger = 'none'
  ) {}
}

/**
 * An action dispatched when the router errors.
 */
export class RouterError<T, V = RouterStateSnapshot> {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Router] RouterError';
  }
  constructor(
    public routerState: V,
    public storeState: T,
    public event: NavigationError,
    public trigger: RouterTrigger = 'none'
  ) {}
}

/**
 * An action dispatched when the `ResolveEnd` event is triggered.
 */
export class RouterDataResolved<T = RouterStateSnapshot> {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Router] RouterDataResolved';
  }
  constructor(
    public routerState: T,
    public event: ResolveEnd,
    public trigger: RouterTrigger = 'none'
  ) {}
}

/**
 * An action dispatched when the router navigation has been finished successfully.
 */
export class RouterNavigated<T = RouterStateSnapshot> {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Router] RouterNavigated';
  }
  constructor(
    public routerState: T,
    public event: NavigationEnd,
    public trigger: RouterTrigger = 'none'
  ) {}
}

/**
 * An union type of router actions.
 */
export type RouterAction<T, V = RouterStateSnapshot> =
  | RouterRequest<V>
  | RouterNavigation<V>
  | RouterCancel<T, V>
  | RouterError<T, V>
  | RouterDataResolved<V>
  | RouterNavigated<V>;
