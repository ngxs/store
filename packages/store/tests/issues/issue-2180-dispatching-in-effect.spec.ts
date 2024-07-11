import {
  Component,
  Injectable,
  effect,
  provideExperimentalZonelessChangeDetection,
  signal
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Action, NgxsModule, Selector, State, StateContext, Store } from '@ngxs/store';
import { skipConsoleLogging } from '@ngxs/store/internals/testing';

describe('Dispatching actions in effects (https://github.com/ngxs/store/issues/2180)', () => {
  class Set {
    static readonly type = 'Set';

    constructor(readonly value: number) {}
  }

  @State<number>({
    name: 'number',
    defaults: 0
  })
  @Injectable()
  class NumberState {
    @Selector()
    static getNumber(number: number): number {
      return number;
    }

    @Action(Set)
    set(ctx: StateContext<number>, action: Set) {
      ctx.setState(action.value);
    }
  }

  @Component({
    template: `
      <h1>{{ value() }}</h1>
      <h2>{{ valueFromState() }}</h2>
      <button (click)="updateValue()">Click me</button>
    `
  })
  class TestComponent {
    value = signal(0);
    valueFromState = this.store.selectSignal(NumberState.getNumber);

    constructor(private store: Store) {
      effect(() => {
        const value = this.value();
        store.dispatch(new Set(value));
      });
    }

    updateValue() {
      this.value.update(value => value + 100);
    }
  }

  it('should allow dispatching actions in effects', async () => {
    // Arrange
    skipConsoleLogging(() =>
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [NgxsModule.forRoot([NumberState])],
        providers: [provideExperimentalZonelessChangeDetection()]
      })
    );

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    // Act
    document.querySelector('button')!.click();
    await fixture.whenStable();

    document.querySelector('button')!.click();
    await fixture.whenStable();

    // Assert
    expect(document.querySelector('h1')!.innerHTML).toEqual('200');
    expect(document.querySelector('h2')!.innerHTML).toEqual('200');
  });
});
