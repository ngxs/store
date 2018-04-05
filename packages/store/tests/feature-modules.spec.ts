import { TestBed } from '@angular/core/testing';
import { RouterTestingModule, SpyNgModuleFactoryLoader } from '@angular/router/testing';
import { NgModuleFactoryLoader, NgModule, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { State } from '../src/state';
import { Action } from '../src/action';
import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { StateContext } from '../src/symbols';

describe('FeatureModules', () => {
  let loader: SpyNgModuleFactoryLoader;
  let router: Router;
  let store: Store;

  class Increment {}

  @State<number>({
    name: 'counter',
    defaults: 0
  })
  class MyState {
    @Action(Increment)
    increment({ getState, setState }: StateContext<number>) {
      setState(getState() + 1);
    }
  }

  class Increment2 {}

  @State<number>({
    name: 'counter2',
    defaults: 0
  })
  class MyState2 {
    @Action(Increment2)
    increment({ getState, setState }: StateContext<number>) {
      setState(getState() + 1);
    }
  }

  @Component({ template: 'Hello World' })
  class MyComponent {}

  @NgModule({
    declarations: [MyComponent],
    imports: [RouterModule.forChild([{ path: '', component: MyComponent }]), NgxsModule.forFeature([MyState])]
  })
  class LazyLoadedModule1 {}

  @Component({ template: 'Hello World' })
  class MyComponent2 {}

  @NgModule({
    declarations: [MyComponent2],
    imports: [RouterModule.forChild([{ path: '', component: MyComponent2 }]), NgxsModule.forFeature([MyState2])]
  })
  class LazyLoadedModule2 {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NgxsModule.forRoot([])]
    });

    loader = TestBed.get(NgModuleFactoryLoader);
    router = TestBed.get(Router);
    store = TestBed.get(Store);

    loader.stubbedModules = { lazyModule1: LazyLoadedModule1, lazyModule2: LazyLoadedModule2 };

    router.resetConfig([
      { path: 'lazy1', loadChildren: 'lazyModule1' },
      { path: 'lazy2', loadChildren: 'lazyModule2' }
    ]);
  });

  it('should dispatch correctly to lazy loaded modules', () => {
    router
      .navigateByUrl('/lazy1')
      .then(() => {
        store.dispatch([new Increment(), new Increment(), new Increment(), new Increment(), new Increment()]);

        store.selectOnce(MyState).subscribe(state => {
          expect(state).toBe(5);
        });
      })
      .then(() => router.navigateByUrl('/lazy2'))
      .then(() => {
        store.dispatch([new Increment2(), new Increment2(), new Increment2(), new Increment2(), new Increment2()]);

        store.select(MyState2).subscribe(state => {
          expect(state).toBe(5);
        });
      });
  });
});
