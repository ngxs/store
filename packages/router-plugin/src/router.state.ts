import { NgZone, Injectable } from '@angular/core';
import {
  NavigationCancel,
  NavigationError,
  Router,
  RouterStateSnapshot,
  RoutesRecognized,
  ResolveEnd,
  NavigationEnd,
  GuardsCheckEnd
} from '@angular/router';
import { Location } from '@angular/common';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { isAngularInTestMode } from '@ngxs/store/internals';
import { filter, take } from 'rxjs/operators';

import {
  Navigate,
  RouterAction,
  RouterCancel,
  RouterError,
  RouterNavigation
} from './router.actions';
import { RouterStateSerializer } from './serializer';

export type RouterStateModel<T = RouterStateSnapshot> = {
  state?: T;
  navigationId?: number;
};

@State<RouterStateModel>({
  name: 'router',
  defaults: {
    state: undefined,
    navigationId: undefined
  }
})
@Injectable()
export class RouterState {
  private routerStateSnapshot: RouterStateSnapshot;
  private routerState: RouterStateModel;
  private lastRoutesRecognized: RoutesRecognized;
  private dispatchTriggeredByRouter = false; // used only in dev mode in combination with routerReducer
  private navigationTriggeredByDispatch = false; // used only in dev mode in combination with routerReducer
  private lastResolvedStateSnapshot: RouterStateSnapshot = null!;

  /**
   * Selectors
   */

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
    private location: Location
  ) {
    this.setUpStoreListener();
    this.setUpStateRollbackEvents();
    this.checkInitialNavigationOnce();
  }

  @Action(Navigate)
  navigate(ctx: StateContext<RouterStateModel>, action: Navigate) {
    this._ngZone.run(() =>
      this._router.navigate(action.path, {
        queryParams: action.queryParams,
        ...action.extras
      })
    );
  }

  @Action([RouterNavigation, RouterError, RouterCancel])
  angularRouterAction(
    ctx: StateContext<RouterStateModel>,
    action: RouterAction<any, RouterStateSnapshot>
  ) {
    ctx.setState({
      ...ctx.getState(),
      state: action.routerState,
      navigationId: action.event.id
    });
  }

  private setUpStoreListener(): void {
    this._store.select(RouterState).subscribe(s => {
      this.routerState = s;
    });
    this._store.select(RouterState.state).subscribe(() => {
      this.navigateIfNeeded();
    });
  }

  private setUpStateRollbackEvents(): void {
    this._router.events.subscribe(e => {
      if (e instanceof RoutesRecognized) {
        this.lastRoutesRecognized = e;
      } else if (e instanceof GuardsCheckEnd || e instanceof ResolveEnd) {
        // The `GuardsCheckEnd` event is always triggered unlike the `ResolveEnd`
        this.lastResolvedStateSnapshot = e.state;
      } else if (e instanceof NavigationEnd) {
        this.navigationEnd();
      } else if (e instanceof NavigationCancel) {
        this.dispatchRouterCancel(e);
      } else if (e instanceof NavigationError) {
        this.dispatchRouterError(e);
      }
    });
  }

  private navigationEnd(): void {
    this.routerStateSnapshot = this._serializer.serialize(this.lastResolvedStateSnapshot);
    if (this.shouldDispatchRouterNavigation()) {
      this.dispatchRouterNavigation();
    }
  }

  private shouldDispatchRouterNavigation(): boolean {
    if (!this.routerState) return true;
    return !this.navigationTriggeredByDispatch;
  }

  private navigateIfNeeded(): void {
    if (!this.routerState || !this.routerState.state || this.dispatchTriggeredByRouter) {
      return;
    }

    if (this._router.url !== this.routerState.state.url) {
      this.navigationTriggeredByDispatch = true;
      this._ngZone.run(() => this._router.navigateByUrl(this.routerState.state!.url));
    }
  }

  private dispatchRouterNavigation(): void {
    this.dispatchRouterAction(
      new RouterNavigation(
        this.routerStateSnapshot,
        new RoutesRecognized(
          this.lastRoutesRecognized.id,
          this.lastRoutesRecognized.url,
          this.lastRoutesRecognized.urlAfterRedirects,
          this.routerStateSnapshot
        )
      )
    );
  }

  private dispatchRouterCancel(event: NavigationCancel): void {
    this.dispatchRouterAction(
      new RouterCancel(this.routerStateSnapshot, this.routerState, event)
    );
  }

  private dispatchRouterError(event: NavigationError): void {
    this.dispatchRouterAction(
      new RouterError(
        this.routerStateSnapshot,
        this.routerState,
        new NavigationError(event.id, event.url, `${event}`)
      )
    );
  }

  private dispatchRouterAction<T>(action: RouterAction<T>): void {
    this.dispatchTriggeredByRouter = true;
    try {
      this._store.dispatch(action);
    } finally {
      this.dispatchTriggeredByRouter = false;
      this.navigationTriggeredByDispatch = false;
    }
  }

  /**
   * No sense to mess up the `setUpStateRollbackEvents` method as we have
   * to perform this check only once and unsubscribe after the first event
   * is triggered
   */
  private checkInitialNavigationOnce(): void {
    if (isAngularInTestMode()) {
      return;
    }

    this._router.events
      .pipe(
        filter((event): event is RoutesRecognized => event instanceof RoutesRecognized),
        take(1)
      )
      .subscribe(({ url }) => {
        // `location.pathname` always equals manually entered URL in the address bar
        // e.g. `location.pathname === '/foo'`, but the `router` state has been initialized
        // with another URL (e.g. used in combination with `NgxsStoragePlugin`), thus the
        // `RouterNavigation` action will be dispatched and the user will be redirected to the
        // previously saved URL. We want to prevent such behavior, so we perform this check
        // in order to redirect user to the manually entered URL if it differs from the recognized one
        if (url !== this.location.path()) {
          this._router.navigateByUrl(location.pathname);
        }
      });
  }
}
