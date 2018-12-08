import { ApplicationRef, NgModuleRef, Type } from '@angular/core';
import { createNewHosts } from '@angularclass/hmr';
import { StateStream, Store } from '../packages/store';
import { Subscription } from 'rxjs';

interface StoreHrmOutlet {
  subscription: Subscription | null;
  store: AppStoreRef | null;
}

interface AppModuleRef {
  _providers: Type<any>[] | any[];
}

interface AppStoreRef {
  _stateStream: StateStream;
}

type ModuleRef = AppModuleRef & NgModuleRef<any>;
type StoreRef = AppStoreRef & Store;

export const hmrBootstrap = (module: any, bootstrap: () => Promise<NgModuleRef<any>>) => {
  const ngxsStoreOutlet: StoreHrmOutlet = { subscription: null, store: null };
  let ngModule: NgModuleRef<any>;

  module.hot.accept();

  bootstrap().then((mod: any) => {
    ngModule = mod;
    hmrNgxsStore(mod, ngxsStoreOutlet);
  });

  module.hot.dispose(() => {
    hmrNgxsStorePersist(ngxsStoreOutlet);
    const appRef: ApplicationRef = ngModule.injector.get(ApplicationRef);
    const elements = appRef.components.map(c => c.location.nativeElement);
    const makeVisible = createNewHosts(elements);
    ngModule.destroy();
    makeVisible();
  });
};

function hmrNgxsStore(mod: NgModuleRef<any>, outlet: StoreHrmOutlet): void {
  let storeRef: AppStoreRef | null = null;

  const moduleRef: any = mod as ModuleRef;
  const providers = moduleRef._providers.filter(
    (provider: any) => provider instanceof Object && provider.constructor.name === 'Store'
  );
  const StoreRefInstance = providers[0];

  if (StoreRefInstance) {
    storeRef = StoreRefInstance as StoreRef;
    const currentState = JSON.stringify(storeRef._stateStream.value);
    const cacheState = localStorage.getItem('__store__');
    const usageHmrState = cacheState && cacheState !== currentState;

    outlet.subscription = storeRef._stateStream.subscribe(newState => {
      localStorage.setItem('__store__', JSON.stringify(newState));
    });

    if (usageHmrState) {
      const state: object = JSON.parse(cacheState || '{}');
      storeRef._stateStream.next(state);
    }
  }

  outlet.store = storeRef;
}

function hmrNgxsStorePersist(outlet: StoreHrmOutlet) {
  outlet.subscription && outlet.subscription.unsubscribe();
  if (outlet.store) {
    localStorage.setItem('__store__', JSON.stringify(outlet.store._stateStream.value));
  }
}
