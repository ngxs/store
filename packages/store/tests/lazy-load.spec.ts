import { Component, NgModule, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterModule, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, NgxsModule } from '@ngxs/store';
import { Observable } from 'rxjs';
import { skip } from 'rxjs/operators';

import { CounterState, MathService, Increment } from './helpers/counter.state';
import { TodoState, AddTodo } from './helpers/todo.state';
import { SimpleState, UpdateValue } from './helpers/simple.state';

describe('Lazy Loading', () => {
  @Component({ selector: 'my', template: '' })
  class MyComponent {
    counter: Observable<number> = inject(Store).select(CounterState.getCounter);
  }

  @Component({ selector: 'my-lazy', template: '' })
  class MyLazyComponent {
    todos: Observable<string[]> = inject(Store).select(TodoState.getTodos);
  }

  @NgModule({
    imports: [
      RouterModule.forChild([{ path: '', component: MyLazyComponent }]),
      NgxsModule.forFeature([TodoState])
    ],
    declarations: [MyLazyComponent]
  })
  class MyLazyModule {}

  @Component({ selector: 'second-lazy', template: '' })
  class SecondLazyComponent {
    value: Observable<string> = inject(Store).select(SimpleState.getSimple);
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

    router = TestBed.inject(Router);

    router.resetConfig([
      { path: 'todos', loadChildren: () => MyLazyModule },
      { path: 'simple', loadChildren: () => SecondLazyModule }
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
    const store: Store = TestBed.inject(Store);

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
