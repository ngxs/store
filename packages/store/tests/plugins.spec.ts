import { Action, NgxsOnInit, State, StateContext, PluginManager } from '@ngxs/store';
import { Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { NgxsModule } from '../src/module';
import { NGXS_PLUGINS } from '../src/plugin_api';
import { Store } from '../src/store';

describe('Plugins', () => {
  it('should run a function plugin', () => {
    let pluginInvoked = 0;

    class Foo {
      static readonly type = 'Foo';
    }

    function logPlugin(
      state: any,
      action: any,
      next: (state: any, action: any) => Observable<any>
    ) {
      if (action.constructor && action.constructor.type === 'Foo') {
        pluginInvoked++;
      }

      return next(state, action).pipe(
        tap(() => {
          if (action.constructor.type === 'Foo') {
            pluginInvoked++;
          }
        })
      );
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()],
      providers: [
        {
          provide: NGXS_PLUGINS,
          useValue: logPlugin,
          multi: true
        }
      ]
    });

    const store: Store = TestBed.get(Store);
    store.dispatch(new Foo());

    expect(pluginInvoked).toEqual(2);
  });

  it('should be init when use plugin in lazy module', () => {
    function myLazyPlugin(
      state: any,
      action: any,
      next: (state: any, action: any) => Observable<any>
    ) {
      return next(state, action);
    }

    @NgModule()
    class MyPluginModule {
      public static forFeature(): ModuleWithProviders {
        return {
          ngModule: MyPluginModule,
          providers: [{ provide: NGXS_PLUGINS, useValue: myLazyPlugin, multi: true }]
        };
      }
    }

    @NgModule({ imports: [NgxsModule.forFeature(), MyPluginModule.forFeature()] })
    class FeatureModule {}

    function myRootPlugin(
      state: any,
      action: any,
      next: (state: any, action: any) => Observable<any>
    ) {
      return next(state, action);
    }

    @NgModule({
      imports: [NgxsModule.forRoot(), FeatureModule],
      providers: [
        {
          provide: NGXS_PLUGINS,
          useValue: myRootPlugin,
          multi: true
        }
      ]
    })
    class RootModule {}

    TestBed.configureTestingModule({ imports: [RootModule] });

    const manager: PluginManager = TestBed.get(PluginManager);
    expect(manager.plugins.length).toEqual(2);

    expect(manager.plugins[0].name).toEqual('myLazyPlugin');
    expect(manager.plugins[1].name).toEqual('myRootPlugin');
  });

  it('should be can add dynamic plugins', fakeAsync(() => {
    function myRootPlugin(
      state: any,
      action: any,
      next: (state: any, action: any) => Observable<any>
    ) {
      return next(state, action);
    }

    @State<number[]>({
      name: 'app',
      defaults: [1, 2, 3]
    })
    class AppState implements NgxsOnInit {
      public ngxsOnInit(ctx: StateContext<number[]>): void {
        ctx.setState(ctx.getState().concat(4));
      }

      @Action({ type: 'reset' })
      public reset(): void {}
    }

    @Injectable()
    class MyService {
      constructor(public pluginManager: PluginManager) {
        setTimeout(() => {
          pluginManager.registerPlugin(function resetPlugin(
            state: any,
            action: any,
            next: (state: any, action: any) => Observable<any>
          ) {
            return next(action.type === 'reset' ? {} : state, action);
          });
        }, 500);
      }
    }

    @NgModule({ imports: [NgxsModule.forFeature([AppState])], providers: [MyService] })
    class LazyModule {}

    @NgModule({
      imports: [NgxsModule.forRoot(), LazyModule],
      providers: [
        {
          provide: NGXS_PLUGINS,
          useValue: myRootPlugin,
          multi: true
        }
      ]
    })
    class RootModule {}

    TestBed.configureTestingModule({ imports: [RootModule] });
    const service: MyService = TestBed.get(MyService);
    const manager: PluginManager = TestBed.get(PluginManager);
    const store: Store = TestBed.get(Store);

    expect(service.pluginManager === manager).toEqual(true);

    tick(1000);

    expect(service.pluginManager.plugins.length).toEqual(2);
    expect(service.pluginManager.plugins === manager.plugins).toEqual(true);

    expect(store.snapshot()).toEqual({ app: [1, 2, 3, 4] });

    store.dispatch({ type: 'reset' });
    expect(store.snapshot()).toEqual({});
  }));
});
