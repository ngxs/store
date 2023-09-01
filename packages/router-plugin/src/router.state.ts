import { NgZone, Injectable, OnDestroy, Injector } from '@angular/core';
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
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  NavigationActionTiming,
  NgxsRouterPluginOptions,
  ɵNGXS_ROUTER_PLUGIN_OPTIONS
} from '@ngxs/router-plugin/internals';
import { Subscription } from 'rxjs';

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

@State<RouterStateModel>({
  name: 'router',
  defaults: {
    state: undefined,
    navigationId: undefined,
    trigger: 'none'
  }
})
@Injectable()
export class RouterState implements OnDestroy {
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

  private _subscription = new Subscription();

  private _options: NgxsRouterPluginOptions | null = null;

  @Selector()
  static state<T = RouterStateSnapshot>(state: RouterStateModel<T>) {
    return state && state.state;
  }

  @Selector()
  static url(state: RouterStateModel): string | undefined {
    return state && state.state && state.state.url;
  }

  constructor(
    private _store: Store,
    private _router: Router,
    private _serializer: RouterStateSerializer<RouterStateSnapshot>,
    private _ngZone: NgZone,
    injector: Injector
  ) {
    // Note: do not use `@Inject` since it fails on lower versions of Angular with Jest
    // integration, it cannot resolve the token provider.
    this._options = injector.get(ɵNGXS_ROUTER_PLUGIN_OPTIONS, null);
    this._setUpStoreListener();
    this._setUpRouterEventsListener();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
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
    RouterRequest,
    RouterNavigation,
    RouterError,
    RouterCancel,
    RouterDataResolved,
    RouterNavigated
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
    const subscription = this._store
      .select(RouterState)
      .subscribe((state: RouterStateModel | undefined) => {
        this._navigateIfNeeded(state);
      });

    this._subscription.add(subscription);
  }

  private _navigateIfNeeded(routerState: RouterStateModel | undefined): void {
    if (routerState && routerState.trigger === 'devtools') {
      this._storeState = this._store.selectSnapshot(RouterState);
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

    this._storeState = this._store.selectSnapshot(RouterState);
    this._trigger = 'store';
    this._ngZone.run(() => this._router.navigateByUrl(this._storeState!.state!.url));
  }

  private _setUpRouterEventsListener(): void {
    const dispatchRouterNavigationLate =
      this._options != null &&
      this._options.navigationActionTiming === NavigationActionTiming.PostActivation;

    let lastRoutesRecognized: RoutesRecognized;

    const subscription = this._router.events.subscribe(event => {
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

    this._subscription.add(subscription);
  }

  /** Reacts to `NavigationStart`. */
  private _navigationStart(event: NavigationStart): void {
    this._routerState = this._serializer.serialize(this._router.routerState.snapshot);

    if (this._trigger !== 'none') {
      this._storeState = this._store.selectSnapshot(RouterState);
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
