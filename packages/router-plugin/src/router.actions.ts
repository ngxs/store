import { NavigationCancel, NavigationError, RouterStateSnapshot, RoutesRecognized } from '@angular/router';

/**
 * Payload of RouterNavigation.
 */
export type RouterNavigationPayload<T> = {
  routerState: T;
  event: RoutesRecognized;
};

/**
 * An action dispatched when the router navigates.
 */

export class RouterNavigation<T = RouterStateSnapshot> {
  constructor(public payload: RouterNavigationPayload<T>) {}
}

/**
 * Payload of RouterCancel.
 */
export type RouterCancelPayload<T, V> = {
  routerState: V;
  storeState: T;
  event: NavigationCancel;
};

/**
 * An action dispatched when the router cancel navigation.
 */
export class RouterCancel<T, V = RouterStateSnapshot> {
  constructor(public payload: RouterCancelPayload<T, V>) {}
}

/**
 * Payload of RouterError.
 */
export type RouterErrorPayload<T, V> = {
  routerState: V;
  storeState: T;
  event: NavigationError;
};

/**
 * An action dispatched when the router errors.
 */
export class RouterError<T, V = RouterStateSnapshot> {
  constructor(public payload: RouterErrorPayload<T, V>) {}
}

/**
 * An union type of router actions.
 */
export type RouterAction<T, V = RouterStateSnapshot> = RouterNavigation<V> | RouterCancel<T, V> | RouterError<T, V>;
