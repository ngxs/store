import { Component, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { NgxsModule, Store } from '@ngxs/store';
import { NgxsRouterPluginModule, NgxsRouterPluginOptions, RouterState } from '../';

describe('NgxsRouterPlugin', () => {
  it('should work', (done: any) => {
    // const reducer = (state: string = '', action: RouterAction<any>) => {
    //   if (action.type === ROUTER_NAVIGATION) {
    //     return action.payload.routerState.url.toString();
    //   } else {
    //     return state;
    //   }
    // };

    createTestModule();

    const router: Router = TestBed.get(Router);
    const store = TestBed.get(Store);
    const log = logOfRouterAndStore(router, store);

    router.navigateByUrl('/').then(() => {
      console.log(JSON.stringify(log, null, 2));

      expect(log).toEqual([
        { type: 'state', state: null }, // init event. has nothing to do with the router
        { type: 'router', event: 'NavigationStart', url: '/' },
        { type: 'router', event: 'RoutesRecognized', url: '/' },
        { type: 'state', state: '/' }, // RouterNavigation event in the store
        { type: 'router', event: 'GuardsCheckStart', url: '/' },
        { type: 'router', event: 'GuardsCheckEnd', url: '/' },
        { type: 'router', event: 'ResolveStart', url: '/' },
        { type: 'router', event: 'ResolveEnd', url: '/' },

        { type: 'router', event: 'NavigationEnd', url: '/' }
      ]);
      done();
    });
    //      .then(() => {
    //        log.splice(0);
    //        return router.navigateByUrl('next');
    //      })
    //      .then(() => {
    //        expect(log).toEqual([
    //          { type: 'router', event: 'NavigationStart', url: '/next' },
    //          { type: 'router', event: 'RoutesRecognized', url: '/next' },
    //          { type: 'state', state: '/next' },
    //
    //          /* new Router Lifecycle in Angular 4.3 */
    //          { type: 'router', event: 'GuardsCheckStart', url: '/next' },
    //          { type: 'router', event: 'GuardsCheckEnd', url: '/next' },
    //          { type: 'router', event: 'ResolveStart', url: '/next' },
    //          { type: 'router', event: 'ResolveEnd', url: '/next' },
    //
    //          { type: 'router', event: 'NavigationEnd', url: '/next' },
    //        ]);
    //
    //        done();
    //      });
  });
});

function createTestModule(
  opts: {
    canActivate?: Function;
    canLoad?: Function;
    providers?: Provider[];
    config?: NgxsRouterPluginOptions;
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
      RouterTestingModule.withRoutes([
        { path: '', component: SimpleCmp },
        {
          path: 'next',
          component: SimpleCmp,
          canActivate: ['CanActivateNext']
        },
        {
          path: 'load',
          loadChildren: 'test',
          canLoad: ['CanLoadNext']
        }
      ]),
      NgxsRouterPluginModule.forRoot(opts.config)
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

// function waitForNavigation(router: Router): Promise<any> {
//   return router.events.pipe(
//     filter(e => e instanceof NavigationEnd),
//     first(),
//   ).toPromise();
// }

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
  store.select(RouterState.url).subscribe(state => log.push({ type: 'state', state }));
  return log;
}
