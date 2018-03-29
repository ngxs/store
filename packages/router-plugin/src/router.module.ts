import { NgModule, ModuleWithProviders } from '@angular/core';
import { NavigationCancel, NavigationError, Router, RouterStateSnapshot, RoutesRecognized } from '@angular/router';

import { Store } from '@ngxs/store';
import { NGXS_ROUTER_PLUGIN_OPTIONS, NgxsRouterPluginOptions } from './symbols';
import { RouterAction, RouterCancel, RouterError, RouterNavigation } from './router.actions';
import { DefaultRouterStateSerializer, RouterStateSerializer } from './serializer';
import { RouterState, RouterStateModel } from './router.state';

import { of } from 'rxjs/observable/of';
import { FEATURE_STATE_TOKEN } from '@ngxs/store/src/symbols';

export const defaultRouterStateOptions: NgxsRouterPluginOptions = {};

@NgModule()
export class NgxsRouterPluginModule {
  private routerStateSnapshot: RouterStateSnapshot;
  private routerState: RouterStateModel;
  private lastRoutesRecognized: RoutesRecognized;
  private dispatchTriggeredByRouter = false; // used only in dev mode in combination with routerReducer
  private navigationTriggeredByDispatch = false; // used only in dev mode in combination with routerReducer

  static forRoot(options?: NgxsRouterPluginOptions): ModuleWithProviders {
    return {
      ngModule: NgxsRouterPluginModule,
      providers: [
        {
          provide: NGXS_ROUTER_PLUGIN_OPTIONS,
          useValue: {
            ...defaultRouterStateOptions,
            ...options
          }
        },
        { provide: RouterStateSerializer, useClass: DefaultRouterStateSerializer },

        {
          provide: FEATURE_STATE_TOKEN,
          multi: true,
          useValue: [RouterState]
        }
      ]
    };
  }

  constructor(
    private store: Store,
    private router: Router,
    private serializer: RouterStateSerializer<RouterStateSnapshot>
  ) // @Inject(NGXS_ROUTER_PLUGIN_OPTIONS) private options: NgxsRouterPluginOptions
  {
    this.setUpBeforePreactivationHook();
    this.setUpStoreStateListener();
    this.setUpStateRollbackEvents();
  }

  private setUpBeforePreactivationHook(): void {
    (<any>this.router).hooks.beforePreactivation = (routerStateSnapshot: RouterStateSnapshot) => {
      this.routerStateSnapshot = this.serializer.serialize(routerStateSnapshot);
      if (this.shouldDispatchRouterNavigation()) this.dispatchRouterNavigation();
      return of(true);
    };
  }

  private setUpStoreStateListener(): void {
    this.store.select(RouterState).subscribe(s => {
      this.routerState = s;
    });
    this.store.select(RouterState.state).subscribe(() => {
      this.navigateIfNeeded();
    });
  }

  private setUpStateRollbackEvents(): void {
    this.router.events.subscribe(e => {
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

    if (this.router.url !== this.routerState.state.url) {
      this.navigationTriggeredByDispatch = true;
      this.router.navigateByUrl(this.routerState.state.url);
    }
  }

  private dispatchRouterNavigation(): void {
    this.dispatchRouterAction(
      new RouterNavigation({
        routerState: this.routerStateSnapshot,
        event: new RoutesRecognized(
          this.lastRoutesRecognized.id,
          this.lastRoutesRecognized.url,
          this.lastRoutesRecognized.urlAfterRedirects,
          this.routerStateSnapshot
        )
      })
    );
  }

  private dispatchRouterCancel(event: NavigationCancel): void {
    this.dispatchRouterAction(
      new RouterCancel({
        routerState: this.routerStateSnapshot,
        storeState: this.routerState,
        event
      })
    );
  }

  private dispatchRouterError(event: NavigationError): void {
    this.dispatchRouterAction(
      new RouterError({
        routerState: this.routerStateSnapshot,
        storeState: this.routerState,
        event: new NavigationError(event.id, event.url, `${event}`)
      })
    );
  }

  private dispatchRouterAction<T>(action: RouterAction<T>): void {
    this.dispatchTriggeredByRouter = true;
    try {
      this.store.dispatch(action);
    } finally {
      this.dispatchTriggeredByRouter = false;
      this.navigationTriggeredByDispatch = false;
    }
  }
}
