import { NavigationCancel, NavigationError, Router, RouterStateSnapshot, RoutesRecognized } from '@angular/router';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { of } from 'rxjs';

import { Navigate, RouterAction, RouterCancel, RouterError, RouterNavigation } from './router.actions';
import { RouterStateSerializer } from './serializer';
import { NgZone } from '@angular/core';

export type RouterStateModel<T = RouterStateSnapshot> = {
  state: T;
  navigationId: number;
};

@State<RouterStateModel>({
  name: 'router',
  defaults: {
    state: null,
    navigationId: null
  }
})
export class RouterState {
  private routerStateSnapshot: RouterStateSnapshot;
  private routerState: RouterStateModel;
  private lastRoutesRecognized: RoutesRecognized;
  private dispatchTriggeredByRouter = false; // used only in dev mode in combination with routerReducer
  private navigationTriggeredByDispatch = false; // used only in dev mode in combination with routerReducer

  /**
   * Selectors
   */

  @Selector()
  static state(state: RouterStateModel) {
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
    private _ngZone: NgZone
  ) {
    this.setUpRouterHook();
    this.setUpStoreListener();
    this.setUpStateRollbackEvents();
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
  angularRouterAction(ctx: StateContext<RouterStateModel>, action: RouterAction<any, RouterStateSnapshot>) {
    ctx.setState({
      ...ctx.getState(),
      state: action.routerState,
      navigationId: action.event.id
    });
  }

  /**
   * Hook into the angular router before each navigation action is performed
   * since the route tree can be large, we serialize it into something more manageable
   */
  private setUpRouterHook(): void {
    (<any>this._router).hooks.beforePreactivation = (routerStateSnapshot: RouterStateSnapshot) => {
      this.routerStateSnapshot = this._serializer.serialize(routerStateSnapshot);
      if (this.shouldDispatchRouterNavigation()) this.dispatchRouterNavigation();
      return of(true);
    };
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
      } else if (e instanceof NavigationCancel) {
        this.dispatchRouterCancel(e);
      } else if (e instanceof NavigationError) {
        this.dispatchRouterError(e);
      }
    });
  }

  private shouldDispatchRouterNavigation(): boolean {
    if (!this.routerState) return true;
    return !this.navigationTriggeredByDispatch;
  }

  private navigateIfNeeded(): void {
    if (!this.routerState || !this.routerState.state) {
      return;
    }
    if (this.dispatchTriggeredByRouter) return;

    if (this._router.url !== this.routerState.state.url) {
      this.navigationTriggeredByDispatch = true;
      this._ngZone.run(() => this._router.navigateByUrl(this.routerState.state.url));
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
    this.dispatchRouterAction(new RouterCancel(this.routerStateSnapshot, this.routerState, event));
  }

  private dispatchRouterError(event: NavigationError): void {
    this.dispatchRouterAction(
      new RouterError(this.routerStateSnapshot, this.routerState, new NavigationError(event.id, event.url, `${event}`))
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
}
