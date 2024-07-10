import {
  Component,
  Injectable,
  effect,
  provideExperimentalZonelessChangeDetection,
  signal
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Action, NgxsModule, Selector, State, StateContext, Store } from '@ngxs/store';

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
      <button (click)="updateValue()">Click me</button>
    `
  })
  class TestComponent {
    value = signal(0);

    constructor(store: Store) {
      effect(() => {
        const value = this.value();
        store.dispatch(new Set(value));
      });
    }

    updateValue() {
      this.value.set(100);
    }
  }

  it('should allow dispatching actions in effects', async () => {
    // Arrange
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [NgxsModule.forRoot([NumberState])],
      providers: [provideExperimentalZonelessChangeDetection()]
    });

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    // Act
    document.querySelector('button')!.click();
    await fixture.whenStable();

    // Assert
    expect(document.querySelector('h1')!.innerHTML).toEqual('100');
  });
});
