import { Router } from '@angular/router';
import { Store, Actions } from '@ngxs/store';
import { Type } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

export async function createNgxsRouterPluginTestingPlatform<T>(module: Type<T>) {
  const { injector } = await platformBrowserDynamic().bootstrapModule(module);
  const store: Store = injector.get(Store);
  const router: Router = injector.get(Router);
  const actions$: Actions = injector.get(Actions);
  return { store, router, actions$, injector };
}
