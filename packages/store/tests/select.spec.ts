import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Component, Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Store, NgxsModule, State, Action, Selector, Select, StateContext } from '@ngxs/store';
import { skipConsoleLogging, freshPlatform } from '@ngxs/store/internals/testing';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { removeDollarAtTheEnd } from '../src/decorators/select/symbols';

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
    // Arrange
    let message: string | null = null;

    // Act
    try {
      class SelectComponent {
        @Select((state: any) => state) state: Observable<any>;
      }

      new SelectComponent().state.subscribe();
    } catch (error) {
      message = error.message;
    }

    // Assert
    expect(message).toEqual('You have forgotten to import the NGXS module!');
  });

  it('should throw an exception when the component class is frozen', () => {
    // Arrange
    function FreezeClass(target: Function): void {
      Object.seal(target);
      Object.freeze(target);
      Object.freeze(target.prototype);
    }

    let message: string | null = null;

    // Act
    try {
      @FreezeClass
      @Component({
        selector: 'my-select',
        template: ''
      })
      class MySelectComponent {
        @Select((state: any) => state)
        state: Observable<any>;
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot(states)],
        declarations: [MySelectComponent]
      });

      const comp = TestBed.createComponent(MySelectComponent);
      comp.componentInstance.state.subscribe();
    } catch (error) {
      message = error.message;
    }

    // Assert
    expect(message).toEqual(
      `Cannot assign to read only property '__state__selector' of object '[object Object]'`
    );
  });

  it('should remove dollar sign at the end of property name', async () => {
    // Assert
    expect(removeDollarAtTheEnd('foo$')).toBe('foo');
    expect(removeDollarAtTheEnd('foo')).toBe('foo');

    // Act
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

    // Assert
    const [counter1, counter2] = await combineLatest([counter$, counter])
      .pipe(take(1))
      .toPromise();
    expect(counter1).toEqual(counter2);
  });

  it('should select the correct state using string', async () => {
    // Arrange
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

    // Act
    const comp = TestBed.createComponent(StringSelectComponent);

    // Assert
    const state = await comp.componentInstance.state.pipe(take(1)).toPromise();
    expect(state.foo).toBe('Hello');
    expect(state.bar).toBe('World');

    const subState = await comp.componentInstance.subState.pipe(take(1)).toPromise();
    expect(subState.hello).toBe(true);
    expect(subState.world).toBe(true);

    const subSubState = await comp.componentInstance.subSubState.pipe(take(1)).toPromise();
    expect(subSubState.name).toBe('Danny');
  });

  it('should select the correct state using a state class', async () => {
    // Arrange
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

    // Assert
    const state = await comp.componentInstance.state.pipe(take(1)).toPromise();
    expect(state.foo).toBe('Hello');
    expect(state.bar).toBe('World');

    const subState = await comp.componentInstance.subState.pipe(take(1)).toPromise();
    expect(subState.hello).toBe(true);
    expect(subState.world).toBe(true);

    const subSubState = await comp.componentInstance.subSubState.pipe(take(1)).toPromise();
    expect(subSubState.name).toBe('Danny');
  });

  it('should select the correct state using a function', async () => {
    // Arrange
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

    // Act
    const comp = TestBed.createComponent(StoreSelectComponent);

    // Assert
    const state = await comp.componentInstance.counter$.pipe(take(1)).toPromise();
    expect(state).toEqual('Hello');
  });

  it('should throw an exception if reserved key used in class', () => {
    // Arrange
    const reservedNameNonConflicted = `__mySelect__selector`;

    @Component({
      selector: 'my-component-1',
      template: ''
    })
    class StoreSelectComponent {
      @Select((state: any) => state)
      mySelect: Observable<string>;

      [reservedNameNonConflicted](): string {
        return `this.mySelect is ${this.mySelect.constructor.name}`;
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [StoreSelectComponent]
    });

    let error: Error = null!;
    // Act
    const component = TestBed.createComponent(StoreSelectComponent).componentInstance;

    try {
      component.mySelect.subscribe();
    } catch (e) {
      error = e;
    }

    // Assert
    expect(error.message).toEqual('component.mySelect.subscribe is not a function');
    expect(component[reservedNameNonConflicted]()).toEqual('this.mySelect is Function');
  });

  it('should select the correct state after timeout', fakeAsync(async () => {
    // Arrange
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
        }, 0);
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [StoreSelectComponent]
    });

    // Act
    const comp = TestBed.createComponent(StoreSelectComponent);
    tick(0);

    // Assert
    const foo = await comp.componentInstance.counter$.pipe(take(1)).toPromise();
    expect(foo).toEqual('bar');
  }));

  it('should not fail when TypeError is thrown in select lambda', async () => {
    // Arrange
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

    // Act
    const comp = TestBed.createComponent(StoreSelectComponent);

    // Assert
    const state = await comp.componentInstance.counter$.pipe(take(1)).toPromise();
    expect(state).toBeUndefined();
  });

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

  it('should not fail when TypeError is thrown in select static method', async () => {
    // Arrange
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

    // Act
    const comp = TestBed.createComponent(StoreSelectComponent);

    // Assert
    const state = await comp.componentInstance.state$.pipe(take(1)).toPromise();
    expect(state).toBeUndefined();
  });

  it('should not fail when TypeError is custom thrown in select lambda', () => {
    // Arrange
    let countTriggeredSelection = 0;

    @State<{ number: { value: number } }>({
      name: 'count',
      defaults: { number: { value: 0 } }
    })
    @Injectable()
    class CountState {
      @Action({ type: 'IncorrectClearState' })
      incorrectClear({ setState }: StateContext<{ number: { value: number } }>): void {
        setState({} as any); // TypeError
      }

      @Action({ type: 'CorrectClearState' })
      correctClear({ setState }: StateContext<{ number: { value: number } }>): void {
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
      count$: Observable<number>;

      constructor(private store: Store) {}

      incorrectClearState(): void {
        this.store.dispatch({ type: 'IncorrectClearState' });
      }

      correctClearState(): void {
        this.store.dispatch({ type: 'CorrectClearState' });
      }

      onClick(): void {
        this.store.dispatch({ type: 'Add' });
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CountState])],
      declarations: [CounterComponent]
    });

    // Act
    const comp = TestBed.createComponent(CounterComponent);

    const subscription: Subscription = comp.componentInstance.count$.subscribe(
      () => countTriggeredSelection++
    );

    skipConsoleLogging(() => {
      comp.componentInstance.onClick();
      comp.componentInstance.incorrectClearState(); // unsubscribe after error

      comp.componentInstance.correctClearState();
      comp.componentInstance.onClick();
    });

    // Assert
    expect(subscription.closed).toEqual(true);
    expect(countTriggeredSelection).toEqual(3);
  });

  it(
    'should complete the state stream once the root view is removed',
    freshPlatform(async () => {
      // Arrange
      @State<string[]>({
        name: 'countries',
        defaults: []
      })
      @Injectable()
      class CountriesState {}

      @Component({
        selector: 'app-root',
        template: ''
      })
      class TestComponent {}

      @NgModule({
        imports: [BrowserModule, NgxsModule.forRoot([CountriesState])],
        declarations: [TestComponent],
        bootstrap: [TestComponent]
      })
      class TestModule {}

      const completeSpy = jest.fn();

      // Act
      const ngModuleRef = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );
      const store = ngModuleRef.injector.get(Store);

      store.select(CountriesState).subscribe({
        complete: completeSpy
      });

      ngModuleRef.destroy();

      // Assert
      expect(completeSpy).toHaveBeenCalled();
    })
  );
});
