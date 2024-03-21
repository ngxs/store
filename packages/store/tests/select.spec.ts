import { TestBed } from '@angular/core/testing';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Component, Injectable, NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Store, NgxsModule, State, Action, Selector, StateContext } from '@ngxs/store';
import { skipConsoleLogging, freshPlatform } from '@ngxs/store/internals/testing';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

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

  it('should fail when TypeError is thrown in select lambda', async () => {
    // Arrange
    @Component({
      selector: 'my-component-1',
      template: ''
    })
    class StoreSelectComponent {
      counter$: Observable<string> = inject(Store).select(
        (state: any) => state.counter.not.here
      );
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [StoreSelectComponent]
    });

    // Act
    const comp = TestBed.createComponent(StoreSelectComponent);

    let message: string | null = null;

    try {
      await skipConsoleLogging(() =>
        comp.componentInstance.counter$.pipe(take(1)).toPromise()
      );
    } catch (error) {
      message = error.message;
    }

    // Assert
    expect(message).toEqual(`Cannot read properties of undefined (reading 'here')`);
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

  it('should fail when TypeError is thrown in select static method', async () => {
    // Arrange
    @Component({
      selector: 'my-component-1',
      template: ''
    })
    class StoreSelectComponent {
      state$ = inject(Store).select(NullSelectorState.notHere);
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([NullSelectorState])],
      declarations: [StoreSelectComponent]
    });

    // Act
    const comp = TestBed.createComponent(StoreSelectComponent);

    let message: string | null = null;

    try {
      await skipConsoleLogging(() => comp.componentInstance.state$.pipe(take(1)).toPromise());
    } catch (error) {
      message = error.message;
    }

    // Assert
    expect(message).toEqual(`Cannot read properties of undefined (reading 'not')`);
  });

  it('should fail when TypeError is re-thrown in select lambda', () => {
    // Arrange
    let countTriggeredSelection = 0;

    @State<{ number: { value: number } }>({
      name: 'count',
      defaults: { number: { value: 0 } }
    })
    @Injectable()
    class CountState {
      @Action({ type: 'IncorrectClearState' })
      incorrectClear(ctx: StateContext<{ number: { value: number } }>): void {
        ctx.setState({} as any); // TypeError
      }

      @Action({ type: 'CorrectClearState' })
      correctClear(ctx: StateContext<{ number: { value: number } }>): void {
        ctx.setState({ number: { value: 0 } });
      }

      @Action({ type: 'Add' })
      add(ctx: StateContext<{ number: { value: number } }>) {
        ctx.setState({ number: { value: ctx.getState().number.value + 1 } });
      }
    }

    @Component({
      selector: 'my-counter',
      template: ``
    })
    class CounterComponent {
      count$ = this.store.select((state: { count: { number: { value: number } } }) => {
        try {
          return state.count.number.value;
        } catch (err) {
          throw err;
        }
      });

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
    expect(countTriggeredSelection).toEqual(2);
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
      class CountriesState {
        @Selector()
        static getCountries(state: string[]) {
          return state;
        }
      }

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

      store.select(CountriesState.getCountries).subscribe({
        complete: completeSpy
      });

      ngModuleRef.destroy();

      // Assert
      expect(completeSpy).toHaveBeenCalled();
    })
  );
});
