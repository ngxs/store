import { Router } from '@angular/router';
import { Store, Actions } from '@ngxs/store';
import { Type, NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { skipConsoleLogging } from '@ngxs/store/internals/testing';

export async function createNgxsRouterPluginTestingPlatform<T>(module: Type<T>) {
  const { injector } = await skipConsoleLogging(() =>
    platformBrowserDynamic().bootstrapModule(module)
  );
  const ngZone: NgZone = injector.get(NgZone);
  const store: Store = injector.get(Store);
  const router: Router = injector.get(Router);
  const actions$: Actions = injector.get(Actions);
  return { store, router, actions$, injector, ngZone };
}
