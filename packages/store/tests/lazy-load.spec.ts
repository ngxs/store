import { Component, NgModule, NgModuleFactoryLoader } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterModule, Router } from '@angular/router';
import { SpyNgModuleFactoryLoader, RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';

import { Store, NgxsModule, Select } from '../src/public_api';
import { CounterState, MathService, Increment } from './helpers/counter.state';
import { TodoState, AddTodo } from './helpers/todo.state';
import { SimpleState, UpdateValue } from './helpers/simple.state';
import { skip } from 'rxjs/operators';

describe('Lazy Loading', () => {
  @Component({ template: '' })
  class MyComponent {
    @Select(CounterState) counter: Observable<number>;
  }

  @Component({ template: '' })
  class MyLazyComponent {
    @Select(TodoState) todos: Observable<string[]>;
  }
  @NgModule({
    imports: [
      RouterModule.forChild([{ path: '', component: MyLazyComponent }]),
      NgxsModule.forFeature([TodoState])
    ],
    declarations: [MyLazyComponent]
  })
  class MyLazyModule {}

  @Component({ template: '' })
  class SecondLazyComponent {
    @Select(SimpleState) value: Observable<string>;
  }
  @NgModule({
    imports: [
      RouterModule.forChild([{ path: '', component: SecondLazyComponent }]),
      NgxsModule.forFeature([SimpleState])
    ],
    declarations: [SecondLazyComponent]
  })
  class SecondLazyModule {}

  let router: Router;

  const navigate = () =>
    router.navigateByUrl('/todos').then(() => router.navigateByUrl('/simple'));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgxsModule.forRoot([]),
        NgxsModule.forFeature([CounterState])
      ],
      declarations: [MyComponent],
      providers: [MathService]
    });

    router = TestBed.get(Router);

    const loader: SpyNgModuleFactoryLoader = TestBed.get(NgModuleFactoryLoader);

    loader.stubbedModules = {
      lazyModule: MyLazyModule,
      secondLazyModule: SecondLazyModule
    };

    router.resetConfig([
      { path: 'todos', loadChildren: 'lazyModule' },
      { path: 'simple', loadChildren: 'secondLazyModule' }
    ]);
  });

  it('should correctly select state from lazy loaded feature modules', () => {
    const c0 = TestBed.createComponent(MyComponent).componentInstance;

    c0.counter.subscribe(res => {
      expect(res).toBe(0);
    });

    navigate().then(() => {
      const c1 = TestBed.createComponent(MyLazyComponent).componentInstance;
      const c2 = TestBed.createComponent(SecondLazyComponent).componentInstance;

      c1.todos.subscribe(res => {
        expect(res).toEqual([]);
      });

      c2.value.subscribe(res => {
        expect(res).toBe('');
      });
    });
  });

  it('should correctly dispatch actions and respond in feature module', () => {
    const store: Store = TestBed.get(Store);

    navigate().then(() => {
      const c0 = TestBed.createComponent(MyComponent).componentInstance; // eager
      const c1 = TestBed.createComponent(MyLazyComponent).componentInstance; // lazy
      const c2 = TestBed.createComponent(SecondLazyComponent).componentInstance; // lazy

      c0.counter.pipe(skip(1)).subscribe(res => {
        expect(res).toBe(2);
      });

      c1.todos.pipe(skip(1)).subscribe(res => {
        expect(res).toEqual(['Hello World']);
      });

      c2.value.pipe(skip(1)).subscribe(res => {
        expect(res).toBe('TEST');
      });

      store.dispatch([
        new Increment(),
        new AddTodo('Hello World'),
        new UpdateValue('TEST'),
        new Increment()
      ]);
    });
  });
});
