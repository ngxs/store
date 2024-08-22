import {
  AfterViewInit,
  Component,
  Injectable,
  effect,
  provideExperimentalZonelessChangeDetection,
  signal
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import {
  Action,
  NgxsModule,
  provideStore,
  select,
  Selector,
  State,
  StateContext,
  Store
} from '@ngxs/store';
import { withExperimentalNgxsPendingTasks } from '@ngxs/store/experimental';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { tap, timer } from 'rxjs';

describe('State per signal', () => {
  class SetNumber {
    static readonly type = 'Set Number';

    constructor(readonly value: number) {}
  }

  class SetNumberAsynchronously {
    static readonly type = 'Set Number Asynchronously';

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

    @Action(SetNumberAsynchronously)
    setNumberAsynchronously(ctx: StateContext<number>, action: SetNumberAsynchronously) {
      return timer(100).pipe(tap(() => ctx.setState(action.value)));
    }
  }

  describe('actions in effects', () => {
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
          store.dispatch(new SetNumber(value));
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

  describe('server-side rendering', () => {
    @Component({
      selector: 'app-root',
      template: `
        <h1>{{ value() }}</h1>
        <h2>{{ number() }}</h2>
      `,
      standalone: true
    })
    class TestComponent implements AfterViewInit {
      value = signal(0);
      number = select(NumberState.getNumber);

      constructor(store: Store) {
        effect(() => {
          const value = this.value();
          store.dispatch(new SetNumber(value));
          store.dispatch(new SetNumberAsynchronously(value + 100));
        });
      }

      ngAfterViewInit(): void {
        this.value.set(100);
      }
    }

    it(
      'should server-side render the content correctly even if the dispatch is untracked',
      freshPlatform(async () => {
        // Arrange
        const html = await skipConsoleLogging(() =>
          renderApplication(
            () =>
              bootstrapApplication(TestComponent, {
                providers: [
                  provideExperimentalZonelessChangeDetection(),
                  provideStore([NumberState], withExperimentalNgxsPendingTasks())
                ]
              }),
            {
              document: '<app-root></app-root>'
            }
          )
        );

        // Assert
        expect(html).toContain('<h1>100</h1>');
        expect(html).toContain('<h2>200</h2>');
      })
    );
  });
});
