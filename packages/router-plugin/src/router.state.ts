import { NgZone, Injectable, inject, DestroyRef } from '@angular/core';
import {
  NavigationCancel,
  NavigationError,
  Router,
  RouterStateSnapshot,
  RoutesRecognized,
  ResolveEnd,
  NavigationStart,
  NavigationEnd,
  Event
} from '@angular/router';
import { Action, Selector, State, StateContext, StateToken, Store } from '@ngxs/store';
import {
  NavigationActionTiming,
  ɵNGXS_ROUTER_PLUGIN_OPTIONS
} from '@ngxs/router-plugin/internals';
import type { Subscription } from 'rxjs';

import {
  Navigate,
  RouterAction,
  RouterCancel,
  RouterError,
  RouterNavigation,
  RouterDataResolved,
  RouterRequest,
  RouterNavigated
} from './router.actions';
import { RouterStateSerializer } from './serializer';

export interface RouterStateModel<T = RouterStateSnapshot> {
  state?: T;
  navigationId?: number;
  trigger: RouterTrigger;
}

export type RouterTrigger =
  | 'none'
  | 'router'
  | 'store'
  // The `devtools` trigger means that the state change has been triggered by Redux DevTools (e.g. when the time-traveling is used).
  | 'devtools';

// NGXS doesn't permit untyped selectors, such as `select(RouterState)`,
// as the `RouterState` class itself lacks type information. Therefore,
// the following state token must replace `RouterState`.
export const ROUTER_STATE_TOKEN = new StateToken<RouterStateModel>('router');

@State<RouterStateModel>({
  name: ROUTER_STATE_TOKEN,
  defaults: {
    state: undefined,
    navigationId: undefined,
    trigger: 'none'
  }
})
@Injectable()
export class RouterState {
  private _store = inject(Store);
  private _router = inject(Router);
  private _serializer: RouterStateSerializer<RouterStateSnapshot> =
    inject(RouterStateSerializer);
  private _ngZone = inject(NgZone);

  /**
   * Determines how navigation was performed by the `RouterState` itself
   * or outside via `new Navigate(...)`
   */
  private _trigger: RouterTrigger = 'none';

  /**
   * That's the serialized state from the `Router` class
   */
  private _routerState: RouterStateSnapshot | null = null;

  /**
   * That's the value of the `RouterState` state
   */
  private _storeState: RouterStateModel | null = null;

  private _lastEvent: Event | null = null;

  private _options = inject(ɵNGXS_ROUTER_PLUGIN_OPTIONS);

  private _subscription!: Subscription;

  @Selector()
  static state<T = RouterStateSnapshot>(state: RouterStateModel<T>) {
    // The `state` is optional if the selector is invoked before the router
    // state is registered in NGXS.
    return state?.state;
  }

  @Selector()
  static url(state: RouterStateModel): string | undefined {
    return state?.state?.url;
  }

  constructor() {
    this._setUpStoreListener();
    this._setUpRouterEventsListener();

    inject(DestroyRef).onDestroy(() => this._subscription.unsubscribe());
  }

  @Action(Navigate)
  navigate(_: StateContext<RouterStateModel>, action: Navigate) {
    return this._ngZone.run(() =>
      this._router.navigate(action.path, {
        queryParams: action.queryParams,
        ...action.extras
      })
    );
  }

  @Action([
    RouterRequest<RouterStateSnapshot>,
    RouterNavigation<RouterStateSnapshot>,
    RouterError<RouterStateModel, RouterStateSnapshot>,
    RouterCancel<RouterStateModel, RouterStateSnapshot>,
    RouterDataResolved<RouterStateSnapshot>,
    RouterNavigated<RouterStateSnapshot>
  ])
  angularRouterAction(
    ctx: StateContext<RouterStateModel>,
    action: RouterAction<RouterStateModel, RouterStateSnapshot>
  ): void {
    ctx.setState({
      trigger: action.trigger,
      state: action.routerState,
      navigationId: action.event.id
    });
  }

  private _setUpStoreListener(): void {
    const routerState$ = this._store.select(ROUTER_STATE_TOKEN);

    routerState$.subscribe((state: RouterStateModel | undefined) => {
      this._navigateIfNeeded(state);
    });
  }

  private _navigateIfNeeded(routerState: RouterStateModel | undefined): void {
    if (routerState && routerState.trigger === 'devtools') {
      this._storeState = this._store.selectSnapshot(ROUTER_STATE_TOKEN);
    }

    const canSkipNavigation =
      !this._storeState ||
      !this._storeState.state ||
      !routerState ||
      routerState.trigger === 'router' ||
      this._router.url === this._storeState.state.url ||
      this._lastEvent instanceof NavigationStart;

    if (canSkipNavigation) {
      return;
    }

    this._storeState = this._store.selectSnapshot(ROUTER_STATE_TOKEN);
    this._trigger = 'store';
    this._ngZone.run(() => this._router.navigateByUrl(this._storeState!.state!.url));
  }

  private _setUpRouterEventsListener(): void {
    const dispatchRouterNavigationLate =
      this._options != null &&
      this._options.navigationActionTiming === NavigationActionTiming.PostActivation;

    let lastRoutesRecognized: RoutesRecognized;

    this._subscription = this._router.events.subscribe(event => {
      this._lastEvent = event;

      if (event instanceof NavigationStart) {
        this._navigationStart(event);
      } else if (event instanceof RoutesRecognized) {
        lastRoutesRecognized = event;
        if (!dispatchRouterNavigationLate && this._trigger !== 'store') {
          this._dispatchRouterNavigation(lastRoutesRecognized);
        }
      } else if (event instanceof ResolveEnd) {
        this._dispatchRouterDataResolved(event);
      } else if (event instanceof NavigationCancel) {
        this._dispatchRouterCancel(event);
        this._reset();
      } else if (event instanceof NavigationError) {
        this._dispatchRouterError(event);
        this._reset();
      } else if (event instanceof NavigationEnd) {
        if (this._trigger !== 'store') {
          if (dispatchRouterNavigationLate) {
            this._dispatchRouterNavigation(lastRoutesRecognized);
          }
          this._dispatchRouterNavigated(event);
        }
        this._reset();
      }
    });
  }

  /** Reacts to `NavigationStart`. */
  private _navigationStart(event: NavigationStart): void {
    this._routerState = this._serializer.serialize(this._router.routerState.snapshot);

    if (this._trigger !== 'none') {
      this._storeState = this._store.selectSnapshot(ROUTER_STATE_TOKEN);
      this._dispatchRouterAction(new RouterRequest(this._routerState, event, this._trigger));
    }
  }

  /** Reacts to `ResolveEnd`. */
  private _dispatchRouterDataResolved(event: ResolveEnd): void {
    const routerState = this._serializer.serialize(event.state);
    this._dispatchRouterAction(new RouterDataResolved(routerState, event, this._trigger));
  }

  /** Reacts to `RoutesRecognized` or `NavigationEnd`, depends on the `navigationActionTiming`. */
  private _dispatchRouterNavigation(lastRoutesRecognized: RoutesRecognized): void {
    const nextRouterState = this._serializer.serialize(lastRoutesRecognized.state);

    this._dispatchRouterAction(
      new RouterNavigation(
        nextRouterState,
        new RoutesRecognized(
          lastRoutesRecognized.id,
          lastRoutesRecognized.url,
          lastRoutesRecognized.urlAfterRedirects,
          nextRouterState
        ),
        this._trigger
      )
    );
  }

  /** Reacts to `NavigationCancel`. */
  private _dispatchRouterCancel(event: NavigationCancel): void {
    this._dispatchRouterAction(
      new RouterCancel(this._routerState!, this._storeState, event, this._trigger)
    );
  }

  /** Reacts to `NavigationEnd`. */
  private _dispatchRouterError(event: NavigationError): void {
    this._dispatchRouterAction(
      new RouterError(
        this._routerState!,
        this._storeState,
        new NavigationError(event.id, event.url, `${event}`),
        this._trigger
      )
    );
  }

  /** Reacts to `NavigationEnd`. */
  private _dispatchRouterNavigated(event: NavigationEnd): void {
    const routerState = this._serializer.serialize(this._router.routerState.snapshot);
    this._dispatchRouterAction(new RouterNavigated(routerState, event, this._trigger));
  }

  private _dispatchRouterAction<T>(action: RouterAction<T>): void {
    this._trigger = 'router';

    try {
      this._store.dispatch(action);
    } finally {
      this._trigger = 'none';
    }
  }

  private _reset(): void {
    this._trigger = 'none';
    this._storeState = null;
    this._routerState = null;
  }
}
