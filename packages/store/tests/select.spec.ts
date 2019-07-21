import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component, Injectable } from '@angular/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { delay, first, last, scan } from 'rxjs/operators';

import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { Select } from '../src/decorators/select';
import { Selector } from '../src/decorators/selector';
import { State } from '../src/decorators/state';
import { Action } from '../src/decorators/action';
import { StateContext } from '../src/symbols';
import { removeDollarAtTheEnd } from '../src/internal/internals';
import { SelectionGlobalStrategy } from '../src/selection/selection-global-strategy';

describe('Select', () => {
  interface SubSubStateModel {
    name: string;
  }

  interface SubStateModel {
    hello: boolean;
    world: boolean;
    subSubProperty?: SubSubStateModel;
  }

  interface StateModel {
    foo: string;
    bar?: string;
    subProperty?: SubStateModel;
  }

  class FooIt {
    static type = 'FooIt';
  }

  @State<SubSubStateModel>({
    name: 'baz',
    defaults: {
      name: 'Danny'
    }
  })
  class MySubSubState {}

  @State<SubStateModel>({
    name: 'boo',
    defaults: {
      hello: true,
      world: true
    },
    children: [MySubSubState]
  })
  class MySubState {}

  @State<StateModel>({
    name: 'counter',
    defaults: {
      foo: 'Hello',
      bar: 'World'
    },
    children: [MySubState]
  })
  class MyState {
    @Action(FooIt)
    fooIt({ setState }: StateContext<StateModel>) {
      setState({ foo: 'bar' });
    }
  }

  const states = [MySubState, MySubSubState, MyState];

  it('should remove dollar sign at the end of property name', () => {
    expect(removeDollarAtTheEnd('foo$')).toBe('foo');
    expect(removeDollarAtTheEnd('foo')).toBe('foo');

    @Component({ template: '' })
    class SelectComponent {
      @Select()
      counter$: Observable<any>;

      @Select()
      counter: Observable<any>;
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [SelectComponent]
    });

    const { counter$, counter } = TestBed.createComponent(SelectComponent).componentInstance;

    combineLatest([counter$, counter])
      .pipe(first())
      .subscribe(([counter1, counter2]) => {
        expect(counter1).toEqual(counter2);
      });
  });

  it('should select the correct state using string', async(() => {
    @Component({
      selector: 'my-component-0',
      template: ''
    })
    class StringSelectComponent {
      @Select('counter') state: Observable<StateModel>;
      @Select('counter.boo') subState: Observable<SubStateModel>;
      @Select('counter.boo.baz') subSubState: Observable<SubSubStateModel>;
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [StringSelectComponent]
    });

    const comp = TestBed.createComponent(StringSelectComponent);

    comp.componentInstance.state.subscribe(state => {
      expect(state.foo).toBe('Hello');
      expect(state.bar).toBe('World');
    });

    comp.componentInstance.subState.subscribe(state => {
      expect(state.hello).toBe(true);
      expect(state.world).toBe(true);
    });

    comp.componentInstance.subSubState.subscribe(state => {
      expect(state.name).toBe('Danny');
    });
  }));

  it('should select the correct state using a state class', async(() => {
    @Component({
      selector: 'my-component-1',
      template: ''
    })
    class StoreSelectComponent {
      @Select(MyState) state: Observable<StateModel>;
      @Select(MySubState) subState: Observable<SubStateModel>;
      @Select(MySubSubState) subSubState: Observable<SubSubStateModel>;
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [StoreSelectComponent]
    });

    const comp = TestBed.createComponent(StoreSelectComponent);

    comp.componentInstance.state.subscribe(state => {
      expect(state.foo).toBe('Hello');
      expect(state.bar).toBe('World');
    });

    comp.componentInstance.subState.subscribe(state => {
      expect(state.hello).toBe(true);
      expect(state.world).toBe(true);
    });

    comp.componentInstance.subSubState.subscribe(state => {
      expect(state.name).toBe('Danny');
    });
  }));

  it('should select the correct state using a function', async(() => {
    @Component({
      selector: 'my-component-1',
      template: ''
    })
    class StoreSelectComponent {
      @Select((state: any) => state.counter.foo)
      counter$: Observable<string>;
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [StoreSelectComponent]
    });

    const comp = TestBed.createComponent(StoreSelectComponent);

    comp.componentInstance.counter$.subscribe(state => {
      expect(state).toBe('Hello');
    });
  }));

  it('should select the correct state after timeout', async(() => {
    @Component({
      selector: 'my-component-1',
      template: ''
    })
    class StoreSelectComponent {
      @Select((state: any) => state.counter.foo)
      counter$: Observable<string>;

      constructor(store: Store) {
        setTimeout(() => {
          store.dispatch(new FooIt());
        }, 100);
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [StoreSelectComponent]
    });

    const comp = TestBed.createComponent(StoreSelectComponent);

    comp.componentInstance.counter$.pipe(first()).subscribe(state2 => {
      expect(state2).toBe('Hello');
    });

    comp.componentInstance.counter$.pipe(last()).subscribe(state2 => {
      expect(state2).toBe('bar');
    });
  }));

  it('should not fail when TypeError is thrown in select lambda', async(() => {
    @Component({
      selector: 'my-component-1',
      template: ''
    })
    class StoreSelectComponent {
      @Select((state: any) => state.counter.not.here)
      counter$: Observable<string>;
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [StoreSelectComponent]
    });

    const comp = TestBed.createComponent(StoreSelectComponent);

    comp.componentInstance.counter$.subscribe(state => {
      expect(state).toBeUndefined();
    });
  }));

  @State<any>({
    name: 'nullselector',
    defaults: {
      foo: 'Hello'
    }
  })
  class NullSelectorState {
    @Selector()
    static notHere(state: any) {
      return state.does.not.exist;
    }
  }

  it('should not fail when TypeError is thrown in select static method', async(() => {
    @Component({
      selector: 'my-component-1',
      template: ''
    })
    class StoreSelectComponent {
      @Select(NullSelectorState.notHere) state$: Observable<any>;
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([NullSelectorState])],
      declarations: [StoreSelectComponent]
    });

    const comp = TestBed.createComponent(StoreSelectComponent);

    comp.componentInstance.state$.subscribe(state => {
      expect(state).toBeUndefined();
    });
  }));

  it('should not fail when TypeError is custom thrown in select lambda', fakeAsync(() => {
    interface CounterModel {
      number: { value: number };
    }

    @State<CounterModel>({
      name: 'count',
      defaults: { number: { value: 0 } }
    })
    class CountState {
      @Action({ type: 'IncorrectClearState' })
      public incorrectClear({ setState }: StateContext<CounterModel>): void {
        setState({} as CounterModel); // TypeError
      }

      @Action({ type: 'CorrectClearState' })
      public correctClear({ setState }: StateContext<CounterModel>): void {
        setState({ number: { value: 0 } });
      }

      @Action({ type: 'Add' })
      add({ setState }: StateContext<CounterModel>) {
        setState((counterState: CounterModel) => ({
          number: { value: counterState.number.value + 1 }
        }));
      }
    }

    @Component({
      selector: 'my-counter',
      template: ``
    })
    class CounterComponent {
      @Select((rootState: { count: CounterModel }) => {
        try {
          return rootState.count.number.value;
        } catch (err) {
          throw err;
        }
      })
      public count$: Observable<number>;

      constructor(private store: Store) {}

      public incorrectClearState(): void {
        this.store.dispatch({ type: 'IncorrectClearState' });
      }

      public correctClearState(): void {
        this.store.dispatch({ type: 'CorrectClearState' });
      }

      public onClick(): void {
        this.store.dispatch({ type: 'Add' });
      }
    }

    @Injectable()
    class CustomSelectionStrategy extends SelectionGlobalStrategy {
      public static readonly DELAY_TIME: number = 500;
      private readonly limit: number = 2;

      public retryWhenHandler(errors: Observable<Error>): Observable<number> {
        return errors.pipe(
          scan((count: number, err: Error): number => this.scanErrorHandler(count, err), 0),
          delay(CustomSelectionStrategy.DELAY_TIME)
        );
      }

      private scanErrorHandler(count: number, err: Error): number {
        if (count > this.limit) {
          throw err;
        }

        return count + 1;
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CountState])],
      providers: [{ provide: SelectionGlobalStrategy, useClass: CustomSelectionStrategy }],
      declarations: [CounterComponent]
    });

    const comp: ComponentFixture<CounterComponent> = TestBed.createComponent(CounterComponent);
    const storeRef: Store = TestBed.get(Store);

    let state: number | null = null;

    const subscription: Subscription = comp.componentInstance.count$.subscribe(
      (value: number) => (state = value)
    );

    expect(subscription.closed).toEqual(false);
    expect(state).toEqual(0);

    comp.componentInstance.onClick();
    expect(state).toEqual(1);

    comp.componentInstance.incorrectClearState(); // TypeError when selection

    expect(storeRef.snapshot()).toEqual({ count: {} });
    expect(subscription.closed).toEqual(false);
    expect(state).toEqual(1);

    comp.componentInstance.correctClearState();
    tick(500); // retry subscribe after delay

    comp.componentInstance.onClick();

    expect(storeRef.snapshot()).toEqual({ count: { number: { value: 1 } } });

    expect(subscription.closed).toEqual(false);
    expect(state).toEqual(1);

    comp.componentInstance.onClick();

    expect(storeRef.snapshot()).toEqual({ count: { number: { value: 2 } } });
    expect(subscription.closed).toEqual(false);
    expect(state).toEqual(2);

    comp.componentInstance.onClick();
    comp.componentInstance.onClick();
    comp.componentInstance.onClick();

    expect(storeRef.snapshot()).toEqual({ count: { number: { value: 5 } } });
    expect(subscription.closed).toEqual(false);
    expect(state).toEqual(5);
  }));
});
