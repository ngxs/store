import {
  APP_INITIALIZER,
  Component,
  Injectable,
  effect,
  inject,
  provideExperimentalZonelessChangeDetection,
  signal
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Action, NgxsModule, Selector, State, StateContext, Store } from '@ngxs/store';
import { skipConsoleLogging } from '@ngxs/store/internals/testing';

describe('State per signal', () => {
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

  @Injectable({ providedIn: 'root' })
  class TestService {
    number = inject(Store).selectSignal(NumberState.getNumber);

    constructor() {
      console.log(this.number());
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
      effect(
        () => {
          const value = this.value();
          store.dispatch(new Set(value));
        }
        // { allowSignalWrites: true }
      );
    }

    updateValue() {
      this.value.set(100);
    }
  }

  it('should allow dispatching actions in effects', async () => {
    // Arrange
    skipConsoleLogging(() =>
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([NumberState]), TestComponent],
        providers: [
          provideExperimentalZonelessChangeDetection(),
          {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: () => {
              inject(TestService);
              return () => {};
            }
          }
        ]
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
    expect(document.querySelector('h1')!.innerHTML).toEqual('100');
  });
});
