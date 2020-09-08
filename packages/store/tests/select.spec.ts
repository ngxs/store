import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { first, last } from 'rxjs/operators';
import { Component, Injectable } from '@angular/core';

import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { State } from '../src/decorators/state';
import { Action } from '../src/decorators/action';
import { Selector } from '../src/decorators/selector/selector';
import { Select } from '../src/decorators/select/select';
import { StateContext } from '../src/symbols';
import { removeDollarAtTheEnd } from '../src/decorators/select/symbols';
import { CONFIG_MESSAGES, VALIDATION_CODE } from '../src/configs/messages.config';

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
  @Injectable()
  class MySubSubState {}

  @State<SubStateModel>({
    name: 'boo',
    defaults: {
      hello: true,
      world: true
    },
    children: [MySubSubState]
  })
  @Injectable()
  class MySubState {}

  @State<StateModel>({
    name: 'counter',
    defaults: {
      foo: 'Hello',
      bar: 'World'
    },
    children: [MySubState]
  })
  @Injectable()
  class MyState {
    @Action(FooIt)
    fooIt({ setState }: StateContext<StateModel>) {
      setState({ foo: 'bar' });
    }
  }

  const states = [MySubState, MySubSubState, MyState];

  it('should throw an exception when the user has forgotten to import the NGXS module', () => {
    try {
      class SelectComponent {
        @Select((state: any) => state) public state: Observable<any>;
      }

      new SelectComponent().state.subscribe();
    } catch (e) {
      expect(e.message).toEqual(
        CONFIG_MESSAGES[VALIDATION_CODE.SELECT_FACTORY_NOT_CONNECTED]()
      );
    }
  });

  it('should throw an exception when the component class is frozen', () => {
    function FreezeClass(target: Function): void {
      Object.seal(target);
      Object.freeze(target);
      Object.freeze(target.prototype);
    }

    try {
      @FreezeClass
      @Component({
        selector: 'my-select',
        template: ''
      })
      class MySelectComponent {
        @Select((state: any) => state)
        public state: Observable<any>;
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot(states)],
        declarations: [MySelectComponent]
      });

      const comp = TestBed.createComponent(MySelectComponent);
      comp.componentInstance.state.subscribe();
    } catch (e) {
      expect(e.message).toEqual(
        `Cannot assign to read only property '__state__selector' of object '[object Object]'`
      );
    }
  });

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

  it('should throw an exception if reserved key used in class', () => {
    const reservedNameNonConflicted = `__mySelect__selector`;

    @Component({
      selector: 'my-component-1',
      template: ''
    })
    class StoreSelectComponent {
      @Select((state: any) => state)
      public mySelect: Observable<string>;

      public [reservedNameNonConflicted](): string {
        return `this.mySelect is ${this.mySelect.constructor.name}`;
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [StoreSelectComponent]
    });

    let error: Error = null!;
    const component: StoreSelectComponent = TestBed.createComponent(StoreSelectComponent)
      .componentInstance;

    try {
      component.mySelect.subscribe();
    } catch (e) {
      error = e;
    }

    expect(error.message).toEqual('component.mySelect.subscribe is not a function');
    expect(component[reservedNameNonConflicted]()).toEqual('this.mySelect is Function');
  });

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
  @Injectable()
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

  it('should not fail when TypeError is custom thrown in select lambda', async(() => {
    console.error = () => {}; // silent error
    let countTriggeredSelection = 0;

    @State<{ number: { value: number } }>({
      name: 'count',
      defaults: { number: { value: 0 } }
    })
    @Injectable()
    class CountState {
      @Action({ type: 'IncorrectClearState' })
      public incorrectClear({ setState }: StateContext<{ number: { value: number } }>): void {
        setState({} as any); // TypeError
      }

      @Action({ type: 'CorrectClearState' })
      public correctClear({ setState }: StateContext<{ number: { value: number } }>): void {
        setState({ number: { value: 0 } });
      }

      @Action({ type: 'Add' })
      add({ getState, setState }: StateContext<{ number: { value: number } }>) {
        setState({ number: { value: getState().number.value + 1 } });
      }
    }

    @Component({
      selector: 'my-counter',
      template: ``
    })
    class CounterComponent {
      @Select((state: { count: { number: { value: number } } }) => {
        try {
          return state.count.number.value;
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

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CountState])],
      declarations: [CounterComponent]
    });

    const comp: ComponentFixture<CounterComponent> = TestBed.createComponent(CounterComponent);

    const subscription: Subscription = comp.componentInstance.count$.subscribe(
      () => countTriggeredSelection++
    );

    comp.componentInstance.onClick();
    comp.componentInstance.incorrectClearState(); // unsubscribe after error

    comp.componentInstance.correctClearState();
    comp.componentInstance.onClick();

    expect(subscription.closed).toEqual(true);
    expect(countTriggeredSelection).toEqual(3);
  }));
});
