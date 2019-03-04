import { NgModule, NgModuleFactoryLoader } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule, SpyNgModuleFactoryLoader } from '@angular/router/testing';
import { Router } from '@angular/router';

import { Action, NgxsModule, State, StateContext, Store } from '../src/public_api';

describe('Lazy loading with duplicate bootstrap states', () => {
  let store: Store;
  let router: Router;
  let loader: SpyNgModuleFactoryLoader;

  class CounterAction {
    public static type = 'increment';
  }

  @State<number>({
    name: 'counter',
    defaults: 0
  })
  class CounterValueState {
    @Action(CounterAction)
    openAlert({ setState }: StateContext<number>): void {
      setState((state: number) => ++state);
    }
  }

  @NgModule({ imports: [CommonModule, NgxsModule.forFeature([CounterValueState])] })
  class LazyModuleA {}

  @NgModule({ imports: [CommonModule, NgxsModule.forFeature([CounterValueState])] })
  class LazyModuleB {}

  @NgModule({ imports: [CommonModule, NgxsModule.forFeature([CounterValueState])] })
  class LazyModuleC {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NgxsModule.forRoot([])]
    });
  });

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    loader = TestBed.get(NgModuleFactoryLoader);
    loader.stubbedModules = {
      lazyModuleA: LazyModuleA,
      lazyModuleB: LazyModuleB,
      lazyModuleC: LazyModuleC
    };

    router.resetConfig([
      { path: 'pathA', loadChildren: 'lazyModuleA' },
      { path: 'pathB', loadChildren: 'lazyModuleB' },
      { path: 'pathC', loadChildren: 'lazyModuleC' }
    ]);
  });

  it('should be correct initial lazy state', fakeAsync(async () => {
    await router.navigateByUrl('/pathA');
    store.dispatch(new CounterAction());
    tick(1000);

    await router.navigateByUrl('/pathB');
    store.dispatch(new CounterAction());
    tick(1000);

    await router.navigateByUrl('/pathC');
    store.dispatch(new CounterAction());
    tick(1000);

    expect(store.snapshot()).toEqual({ counter: 3 });
  }));
});
