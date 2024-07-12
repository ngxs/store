import {
  APP_INITIALIZER,
  Component,
  inject,
  Injectable,
  provideExperimentalZonelessChangeDetection,
  signal,
  ɵwhenStable
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { bootstrapApplication } from '@angular/platform-browser';
import { Action, provideStore, Selector, State, StateContext, Store } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { finalize } from 'rxjs';

describe('Select signal on provider levels', () => {
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

  const recorder: string[] = [];

  @Injectable({ providedIn: 'root' })
  class RootService {
    constructor() {
      const store = inject(Store);

      toObservable(store.selectSignal(NumberState.getNumber))
        .pipe(finalize(() => recorder.push('RootService:finalize')))
        .subscribe(value => {
          recorder.push(`RootService:value:${value}`);
        });
    }
  }

  @Injectable()
  class ChildComponentService {
    constructor() {
      const store = inject(Store);

      toObservable(store.selectSignal(NumberState.getNumber))
        .pipe(finalize(() => recorder.push('ChildComponentService:finalize')))
        .subscribe(value => {
          recorder.push(`ChildComponentService:value:${value}`);
        });
    }
  }

  @Component({
    selector: 'app-child',
    template: '',
    standalone: true,
    providers: [ChildComponentService]
  })
  class ChildComponent {
    constructor(service: ChildComponentService) {}
  }

  @Component({
    selector: 'app-root',
    template: `
      @if (shown()) {
        <app-child />
      }
      <button (click)="shown.set(false)">Toggle</button>
    `,
    standalone: true,
    imports: [ChildComponent]
  })
  class TestComponent {
    shown = signal(true);
  }

  it(
    'should resolve an injection context based on the component tree',
    freshPlatform(async () => {
      // Arrange
      const appRef = await skipConsoleLogging(() =>
        bootstrapApplication(TestComponent, {
          providers: [
            provideExperimentalZonelessChangeDetection(),
            provideStore([NumberState]),
            {
              provide: APP_INITIALIZER,
              multi: true,
              useFactory: () => {
                // Call its constructor.
                inject(RootService);
                return () => {};
              }
            }
          ]
        })
      );

      const store = appRef.injector.get(Store);

      // Assert
      expect(recorder).toEqual(['RootService:value:0', 'ChildComponentService:value:0']);

      // Act
      store.dispatch(new SetNumber(200));
      // Wait for a macrotask to ensure that all scheduled
      // microtasks (promises) are resolved.
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(recorder).toEqual([
        'RootService:value:0',
        'ChildComponentService:value:0',
        'RootService:value:200',
        'ChildComponentService:value:200'
      ]);

      // Act
      document.querySelector('button')!.click();
      await ɵwhenStable(appRef);

      // Assert
      // The child component has been destroyed by clicking the button.
      expect(recorder).toEqual([
        'RootService:value:0',
        'ChildComponentService:value:0',
        'RootService:value:200',
        'ChildComponentService:value:200',
        'ChildComponentService:finalize'
      ]);

      appRef.destroy();

      // Assert
      expect(recorder).toEqual([
        'RootService:value:0',
        'ChildComponentService:value:0',
        'RootService:value:200',
        'ChildComponentService:value:200',
        'ChildComponentService:finalize',
        'RootService:finalize'
      ]);
    })
  );
});
