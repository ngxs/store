import { TestBed } from '@angular/core/testing';
import { Component, Injectable, Injector } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { delay, take, tap } from 'rxjs/operators';

import { State } from '../src/decorators/state';
import { Dispatch } from '../src/decorators/dispatch';
import { Dispatcher } from '../src/decorators/dispatcher';
import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { DispatchAction } from '../src/actions/actions';
import { DispatchEmitter, DISPATCHER_META_KEY, StateContext } from '../src/symbols';

describe('Dispatcher', () => {
  interface Todo {
    text: string;
    completed: boolean;
  }

  it('static metadata should have `type` property same as in @Dispatcher() decorator', () => {
    @State({ name: 'bar' })
    class BarState {
      @Dispatcher({ type: '@@[bar]' })
      static foo() {}
    }

    const BarFooMeta = BarState.foo[DISPATCHER_META_KEY];
    expect(BarFooMeta.type).toBe('@@[bar]');
  });

  it('static metadata should have default `type` property', () => {
    @State({ name: 'bar' })
    class BarState {
      @Dispatcher()
      static foo() {}
    }

    const BarFooMeta = BarState.foo[DISPATCHER_META_KEY];
    expect(BarFooMeta.type).toBe('BarState.foo');
  });

  it('should add todo using @Dispatcher() decorator', () => {
    @State<Todo[]>({
      name: 'todos',
      defaults: []
    })
    class TodosState {
      @Dispatcher()
      public static addTodo(ctx: StateContext<Todo[]>, action: DispatchAction<Todo>) {
        ctx.setState([...ctx.getState(), action.payload]);
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([TodosState])]
    });

    const store: Store = TestBed.get(Store);

    store.emitter<Todo>(TodosState.addTodo).emit({
      text: 'buy coffee',
      completed: false
    });

    const todoLength = store.selectSnapshot<Todo[]>(state => state.todos).length;
    expect(todoLength).toBe(1);
  });

  it('should dispatch an action from the sub state', () => {
    @State({
      name: 'bar2',
      defaults: 10
    })
    class Bar2State {
      @Dispatcher()
      static foo2({ setState }: StateContext<number>) {
        setState(20);
      }
    }

    @State({
      name: 'bar',
      defaults: {},
      children: [Bar2State]
    })
    class BarState {}

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([BarState, Bar2State])]
    });

    const store: Store = TestBed.get(Store);
    store.emitter(Bar2State.foo2).emit();

    const bar2Value = store.selectSnapshot(state => state.bar).bar2;
    expect(bar2Value).toBe(20);
  });

  it('should throw an error that such `type` already exists', () => {
    try {
      @State({
        name: 'bar',
        defaults: 10
      })
      class BarState {
        @Dispatcher({ type: 'foo' })
        static foo1() {}

        @Dispatcher({ type: 'foo' })
        static foo2() {}
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([BarState])]
      });
    } catch ({ message }) {
      expect(message).toBe('Method decorated with such type `foo` already exists');
    }
  });

  it('should dispatch an action using @Dispatcher() after delay', () => {
    @Injectable()
    class ApiService {
      private size = 10;

      public getTodosFromServer(length: number): Observable<Todo[]> {
        return of(this.generateTodoMock(length)).pipe(delay(1000));
      }

      private generateTodoMock(size: number): Todo[] {
        const length = size || this.size;
        return Array.from({ length }).map(() => ({
          text: 'buy some coffee',
          completed: false
        }));
      }
    }

    @State<Todo[]>({
      name: 'todos',
      defaults: []
    })
    class TodosState {
      public static injector: Injector | null = null;

      constructor(injector: Injector) {
        TodosState.injector = injector;
      }

      @Dispatcher({ type: '@@[Todos] Set todos sync' })
      public static async setTodosSync({ setState }: StateContext<Todo[]>) {
        setState(
          await TodosState.injector
            .get<ApiService>(ApiService)
            .getTodosFromServer(10)
            .toPromise()
        );
      }

      @Dispatcher({ type: '@@[Todos] Set todos' })
      public static setTodos({ setState }: StateContext<Todo[]>) {
        return TodosState.injector
          .get<ApiService>(ApiService)
          .getTodosFromServer(5)
          .pipe(
            take(1),
            tap(todos => setState(todos))
          );
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([TodosState])],
      providers: [ApiService]
    });

    const store: Store = TestBed.get(Store);

    store
      .emitter<void>(TodosState.setTodosSync)
      .emit()
      .subscribe(() => {
        const todoLength = store.selectSnapshot<Todo[]>(state => state.todos).length;
        expect(todoLength).toBe(10);
      });

    store
      .emitter<void>(TodosState.setTodos)
      .emit()
      .subscribe(() => {
        const todoLength = store.selectSnapshot<Todo[]>(state => state.todos).length;
        expect(todoLength).toBe(5);
      });
  });

  it('should decorate property with @Dispatch() decorator', () => {
    @State<Todo[]>({
      name: 'todos',
      defaults: []
    })
    class TodosState {
      @Dispatcher()
      public static addTodo() {}
    }

    @Component({ template: '' })
    class MockComponent {
      @Dispatch(TodosState.addTodo)
      public addTodoAction: DispatchEmitter<Todo>;
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([TodosState])],
      declarations: [MockComponent]
    });

    const fixture = TestBed.createComponent(MockComponent);
    expect(typeof fixture.componentInstance.addTodoAction).toBe('object');
    expect(typeof fixture.componentInstance.addTodoAction.emit).toBe('function');
  });

  it('should dispatch an action using property decorated with @Dispatch()', () => {
    @State<Todo[]>({
      name: 'todos',
      defaults: []
    })
    class TodosState {
      @Dispatcher({ type: '@@[Todos] Add todo' })
      public static addTodo(ctx: StateContext<Todo[]>, action: DispatchAction<Todo>) {
        ctx.setState([...ctx.getState(), action.payload]);
      }
    }

    @Component({ template: '' })
    class MockComponent {
      @Dispatch(TodosState.addTodo)
      public addTodoAction: DispatchEmitter<Todo>;
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([TodosState])],
      declarations: [MockComponent]
    });

    const store: Store = TestBed.get(Store);
    const fixture = TestBed.createComponent(MockComponent);

    fixture.componentInstance.addTodoAction.emit({
      text: 'buy some coffee',
      completed: false
    });

    const todoLength = store.selectSnapshot<Todo[]>(state => state.todos).length;
    expect(todoLength).toBe(1);
  });
});
