import { Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';

describe('Lazy loading with duplicate bootstrap states', () => {
  let store: Store;
  let router: Router;

  class CounterAction {
    public static type = 'increment';
  }

  @State<number>({
    name: 'counter',
    defaults: 0
  })
  @Injectable()
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
    store = TestBed.inject(Store);
    router = TestBed.inject(Router);

    router.resetConfig([
      { path: 'pathA', loadChildren: () => LazyModuleA },
      { path: 'pathB', loadChildren: () => LazyModuleB },
      { path: 'pathC', loadChildren: () => LazyModuleC }
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
