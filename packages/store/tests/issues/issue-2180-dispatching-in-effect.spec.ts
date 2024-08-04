import {
  Component,
  Injectable,
  effect,
  provideExperimentalZonelessChangeDetection,
  signal,
  untracked
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Action, NgxsModule, Selector, State, StateContext, Store } from '@ngxs/store';
import { skipConsoleLogging } from '@ngxs/store/internals/testing';

describe('State per signal', () => {
  class SetNumber {
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

    @Action(SetNumber)
    setNumber(ctx: StateContext<number>, action: SetNumber) {
      ctx.setState(action.value);
    }
  }

  @Component({
    template: `
      <h1>{{ value() }}</h1>
      <h2>{{ number() }}</h2>
      <button (click)="updateValue()">Click me</button>
    `,
    standalone: true
  })
  class TestComponent {
    value = signal(0);
    number = this.store.selectSignal(NumberState.getNumber);

    constructor(private store: Store) {
      effect(() => {
        const value = this.value();
        untracked(() => store.dispatch(new SetNumber(value)));
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
        imports: [NgxsModule.forRoot([NumberState]), TestComponent],
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
