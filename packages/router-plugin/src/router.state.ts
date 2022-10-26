import { NgZone, Injectable, OnDestroy } from '@angular/core';
import {
  NavigationCancel,
  NavigationError,
  Router,
  RouterStateSnapshot,
  RoutesRecognized,
  ResolveEnd,
  NavigationStart,
  NavigationEnd
} from '@angular/router';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Subscription } from 'rxjs';

import {
  Navigate,
  RouterAction,
  RouterCancel,
  RouterError,
  RouterNavigation,
  RouterDataResolved
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

  private _lastRoutesRecognized: RoutesRecognized = null!;

  private _subscription = new Subscription();

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
    private _ngZone: NgZone
  ) {
    this.setUpStoreListener();
    this.setUpRouterEventsListener();
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

  @Action([RouterNavigation, RouterError, RouterCancel, RouterDataResolved])
  angularRouterAction(
    ctx: StateContext<RouterStateModel>,
    action: RouterAction<RouterStateModel, RouterStateSnapshot>
  ): void {
    ctx.setState({
      ...ctx.getState(),
      trigger: action.trigger,
      state: action.routerState,
      navigationId: action.event.id
    });
  }

  private setUpStoreListener(): void {
    const subscription = this._store
      .select(RouterState)
      .subscribe((state: RouterStateModel | undefined) => {
        this.navigateIfNeeded(state);
      });

    this._subscription.add(subscription);
  }

  private setUpRouterEventsListener(): void {
    const subscription = this._router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.navigationStart();
      } else if (event instanceof RoutesRecognized) {
        this._lastRoutesRecognized = event;
      } else if (event instanceof ResolveEnd) {
        this.dispatchRouterDataResolved(event);
      } else if (event instanceof NavigationCancel) {
        this.dispatchRouterCancel(event);
        this.reset();
      } else if (event instanceof NavigationError) {
        this.dispatchRouterError(event);
        this.reset();
      } else if (event instanceof NavigationEnd) {
        this.navigationEnd();
        this.reset();
      }
    });

    this._subscription.add(subscription);
  }

  private navigationStart(): void {
    this._routerState = this._serializer.serialize(this._router.routerState.snapshot);

    if (this._trigger !== 'none') {
      this._storeState = this._store.selectSnapshot(RouterState);
    }
  }

  private navigationEnd(): void {
    if (this.shouldDispatchRouterNavigation()) {
      this.dispatchRouterNavigation();
    }
  }

  private shouldDispatchRouterNavigation(): boolean {
    if (!this._storeState) return true;
    return this._trigger !== 'store';
  }

  private navigateIfNeeded(state: RouterStateModel | undefined): void {
    if (state && state.trigger === 'devtools') {
      this._storeState = this._store.selectSnapshot(RouterState);
    }

    const canSkipNavigation =
      !this._storeState ||
      !this._storeState.state ||
      !state ||
      state.trigger === 'router' ||
      this._router.url === this._storeState.state.url;

    if (canSkipNavigation) {
      return;
    }

    this._trigger = 'store';
    this._ngZone.run(() => {
      this._router.navigateByUrl(this._storeState!.state!.url);
    });
  }

  private dispatchRouterNavigation(): void {
    const nextRouterState = this._serializer.serialize(this._lastRoutesRecognized.state);

    this.dispatchRouterAction(
      new RouterNavigation(
        nextRouterState,
        new RoutesRecognized(
          this._lastRoutesRecognized.id,
          this._lastRoutesRecognized.url,
          this._lastRoutesRecognized.urlAfterRedirects,
          nextRouterState
        ),
        this._trigger
      )
    );
  }

  private dispatchRouterCancel(event: NavigationCancel): void {
    this.dispatchRouterAction(
      new RouterCancel(this._routerState!, this._storeState, event, this._trigger)
    );
  }

  private dispatchRouterError(event: NavigationError): void {
    this.dispatchRouterAction(
      new RouterError(
        this._routerState!,
        this._storeState,
        new NavigationError(event.id, event.url, `${event}`),
        this._trigger
      )
    );
  }

  private dispatchRouterAction<T>(action: RouterAction<T>): void {
    this._trigger = 'router';

    try {
      this._store.dispatch(action);
    } finally {
      this._trigger = 'none';
    }
  }

  private dispatchRouterDataResolved(event: ResolveEnd): void {
    const routerState = this._serializer.serialize(event.state);
    this.dispatchRouterAction(new RouterDataResolved(routerState, event, this._trigger));
  }

  private reset(): void {
    this._trigger = 'none';
    this._storeState = null;
    this._routerState = null;
  }
}
