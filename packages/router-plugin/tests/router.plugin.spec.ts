import { Component, Provider } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { NgxsModule, Store } from '@ngxs/store';
import { NgxsRouterPluginModule, RouterState, Navigate } from '../';

describe('NgxsRouterPlugin', () => {
  it('should dispatch router state events', async(async () => {
    createTestModule();

    const router: Router = TestBed.get(Router);
    const store = TestBed.get(Store);
    const log = logOfRouterAndStore(router, store);

    await router.navigateByUrl('/');

    expect(log).toEqual([
      { type: 'url', state: undefined }, // init event. has nothing to do with the router
      { type: 'router', event: 'NavigationStart', url: '/' },
      { type: 'router', event: 'RoutesRecognized', url: '/' },
      { type: 'router', event: 'GuardsCheckStart', url: '/' },
      { type: 'router', event: 'GuardsCheckEnd', url: '/' },
      { type: 'router', event: 'ResolveStart', url: '/' },
      { type: 'router', event: 'ResolveEnd', url: '/' },
      { type: 'url', state: '/' }, // RouterNavigation event in the store
      { type: 'router', event: 'NavigationEnd', url: '/' }
    ]);

    log.splice(0);
    await router.navigateByUrl('/next');

    expect(log).toEqual([
      { type: 'router', event: 'NavigationStart', url: '/next' },
      { type: 'router', event: 'RoutesRecognized', url: '/next' },
      { type: 'router', event: 'GuardsCheckStart', url: '/next' },
      { type: 'router', event: 'GuardsCheckEnd', url: '/next' },
      { type: 'router', event: 'ResolveStart', url: '/next' },
      { type: 'router', event: 'ResolveEnd', url: '/next' },
      { type: 'url', state: '/next' },
      { type: 'router', event: 'NavigationEnd', url: '/next' }
    ]);
  }));

  it('should select router state', fakeAsync(async () => {
    createTestModule();

    const router: Router = TestBed.get(Router);
    const store: Store = TestBed.get(Store);

    await router.navigateByUrl('/testpath');
    tick();

    const routerState = store.selectSnapshot(RouterState.state)!;
    expect(routerState.url).toEqual('/testpath');

    const routerUrl = store.selectSnapshot(RouterState.url);
    expect(routerUrl).toEqual('/testpath');
  }));

  it('should handle Navigate action', fakeAsync(async () => {
    createTestModule();

    const store: Store = TestBed.get(Store);

    store.dispatch(new Navigate(['a-path']));
    tick();

    store.select(RouterState.state).subscribe(routerState => {
      expect(routerState!.url).toEqual('/a-path');
    });
  }));
});

function createTestModule(
  opts: {
    canActivate?: Function;
    canLoad?: Function;
    providers?: Provider[];
  } = {}
) {
  @Component({
    selector: 'test-app',
    template: '<router-outlet></router-outlet>'
  })
  class AppCmp {}

  @Component({
    selector: 'pagea-cmp',
    template: 'pagea-cmp'
  })
  class SimpleCmp {}

  TestBed.configureTestingModule({
    declarations: [AppCmp, SimpleCmp],
    imports: [
      NgxsModule.forRoot(),
      RouterTestingModule.withRoutes(
        [
          { path: '', component: SimpleCmp },
          {
            path: ':id',
            component: SimpleCmp,
            canActivate: ['CanActivateNext']
          },
          {
            path: 'load',
            loadChildren: 'test',
            canLoad: ['CanLoadNext']
          }
        ],
        {
          paramsInheritanceStrategy: 'always'
        }
      ),
      NgxsRouterPluginModule.forRoot()
    ],
    providers: [
      {
        provide: 'CanActivateNext',
        useValue: opts.canActivate || (() => true)
      },
      {
        provide: 'CanLoadNext',
        useValue: opts.canLoad || (() => true)
      },
      opts.providers || []
    ]
  });

  TestBed.createComponent(AppCmp);
}

function logOfRouterAndStore(router: Router, store: Store): any[] {
  const log: any[] = [];
  router.events.subscribe(e => {
    if (e.hasOwnProperty('url')) {
      log.push({
        type: 'router',
        event: e.constructor.name,
        url: (<any>e).url.toString()
      });
    }
  });
  store.select(RouterState.url).subscribe(state => log.push({ type: 'url', state }));
  return log;
}
