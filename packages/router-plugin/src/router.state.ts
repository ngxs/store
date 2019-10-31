import { NgZone, Injectable } from '@angular/core';
import {
  NavigationCancel,
  NavigationError,
  Router,
  RouterStateSnapshot,
  RoutesRecognized,
  ResolveEnd,
  UrlSerializer,
  NavigationStart,
  NavigationEnd
} from '@angular/router';
import { LocationStrategy, Location } from '@angular/common';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { isAngularInTestMode } from '@ngxs/store/internals';
import { first, withLatestFrom } from 'rxjs/operators';

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
}

const enum RouterTrigger {
  None = 1,
  Router,
  Store
}

@State<RouterStateModel>({
  name: 'router',
  defaults: {
    state: undefined,
    navigationId: undefined
  }
})
@Injectable()
export class RouterState {
  /**
   * Determines how navigation was performed by the `RouterState` itself
   * or outside via `new Navigate(...)`
   */
  private trigger = RouterTrigger.None;

  /**
   * That's the serialized state from the `Router` class
   */
  private routerState: RouterStateSnapshot | null = null;

  /**
   * That's the value of the `RouterState` state
   */
  private storeState: RouterStateModel | null = null;

  private lastRoutesRecognized: RoutesRecognized = null!;

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
    private _urlSerializer: UrlSerializer,
    private _locationStrategy: LocationStrategy,
    private _location: Location
  ) {
    this.setUpStoreListener();
    this.setUpRouterEventsListener();
    this.checkInitialNavigationOnce();
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
    action: RouterAction<any, RouterStateSnapshot>
  ): void {
    ctx.setState({
      ...ctx.getState(),
      state: action.routerState,
      navigationId: action.event.id
    });
  }

  private setUpStoreListener(): void {
    this._store.select(RouterState.state).subscribe(() => {
      this.navigateIfNeeded();
    });
  }

  private setUpRouterEventsListener(): void {
    this._router.events
      .pipe(withLatestFrom(this._store.select(RouterState)))
      .subscribe(([event, storeState]) => {
        if (event instanceof NavigationStart) {
          this.navigationStart(storeState);
        } else if (event instanceof RoutesRecognized) {
          this.routesRecognized(event);
        } else if (event instanceof ResolveEnd) {
          this.dispatchRouterDataResolved(event);
        } else if (event instanceof NavigationCancel) {
          this.dispatchRouterCancel(event);
          this.reset();
        } else if (event instanceof NavigationError) {
          this.dispatchRouterError(event);
          this.reset();
        } else if (event instanceof NavigationEnd) {
          this.reset();
        }
      });
  }

  private navigationStart(storeState: RouterStateModel | null): void {
    this.routerState = this._serializer.serialize(this._router.routerState.snapshot);

    if (this.trigger !== RouterTrigger.Store) {
      this.storeState = storeState;
    }
  }

  private routesRecognized(event: RoutesRecognized): void {
    this.lastRoutesRecognized = event;

    if (this.shouldDispatchRouterNavigation()) {
      this.dispatchRouterNavigation();
    }
  }

  private shouldDispatchRouterNavigation(): boolean {
    if (!this.storeState) return true;
    return this.trigger !== RouterTrigger.Store;
  }

  private navigateIfNeeded(): void {
    if (
      !this.storeState ||
      !this.storeState.state ||
      this.trigger === RouterTrigger.Router ||
      this._router.url === this.storeState.state.url
    ) {
      return;
    }

    this.trigger = RouterTrigger.Store;
    this._ngZone.run(() => this._router.navigateByUrl(this.storeState!.state!.url));
  }

  private dispatchRouterNavigation(): void {
    const nextRouterState = this._serializer.serialize(this.lastRoutesRecognized.state);

    this.dispatchRouterAction(
      new RouterNavigation(
        nextRouterState,
        new RoutesRecognized(
          this.lastRoutesRecognized.id,
          this.lastRoutesRecognized.url,
          this.lastRoutesRecognized.urlAfterRedirects,
          nextRouterState
        )
      )
    );
  }

  private dispatchRouterCancel(event: NavigationCancel): void {
    this.dispatchRouterAction(new RouterCancel(this.routerState!, this.storeState, event));
    this.reset();
  }

  private dispatchRouterError(event: NavigationError): void {
    this.dispatchRouterAction(
      new RouterError(
        this.routerState!,
        this.storeState,
        new NavigationError(event.id, event.url, `${event}`)
      )
    );
  }

  private dispatchRouterAction<T>(action: RouterAction<T>): void {
    this.trigger = RouterTrigger.Router;

    try {
      this._store.dispatch(action);
    } finally {
      this.trigger = RouterTrigger.None;
    }
  }

  private dispatchRouterDataResolved(event: ResolveEnd): void {
    const routerState = this._serializer.serialize(event.state);
    this.dispatchRouterAction(new RouterDataResolved(routerState, event));
  }

  private reset(): void {
    this.trigger = RouterTrigger.None;
    this.storeState = null;
    this.routerState = null;
  }

  /**
   * No sense to mess up the `setUpRouterEventsListener` method as we have
   * to perform this check only once and unsubscribe after the first event
   * is triggered
   */
  private checkInitialNavigationOnce(): void {
    if (isAngularInTestMode()) {
      return;
    }

    this._router.events
      .pipe(first((event): event is RoutesRecognized => event instanceof RoutesRecognized))
      .subscribe(({ url }) => {
        // `location.pathname` always equals manually entered URL in the address bar
        // e.g. `location.pathname === '/foo'`, but the `router` state has been initialized
        // with another URL (e.g. used in combination with `NgxsStoragePlugin`), thus the
        // `RouterNavigation` action will be dispatched and the user will be redirected to the
        // previously saved URL. We want to prevent such behavior, so we perform this check

        // `url` is a recognized URL by the Angular's router, while `currentUrl` is an actual URL
        // entered in the browser's address bar
        // `PathLocationStrategy.prototype.path()` returns a concatenation of
        // `PlatformLocation.pathname` and normalized `PlatformLocation.search`.

        // `Location.prototype.normalize` strips base href from the URL,
        // if `baseHref` (declared in angular.json) for example is `/en`
        // and the URL is `/test#anchor` - then `_locationStrategy.path(true)` will return `/en/test#anchor`,
        // but `/en/test#anchor` is not known to the Angular's router, so we have to strip `/en`
        // from the URL
        const currentUrl = this._location.normalize(this._locationStrategy.path(true));
        const currentUrlTree = this._urlSerializer.parse(currentUrl);
        // We need to serialize the URL because in that example `/test/?redirect=https://google.com/`
        // Angular will recognize it as `/test?redirect=https:%2F%2Fwww.google.com%2F`
        // so we have to run the `currentUrl` via the `UrlSerializer` that will encode characters
        const currentSerializedUrl = this._urlSerializer.serialize(currentUrlTree);

        // If URLs differ from each other - we've got to perform a redirect to the manually entered URL
        // in the address bar, as it must have a priority
        if (currentSerializedUrl !== url) {
          this._router.navigateByUrl(currentUrl);
        }
      });
  }
}
