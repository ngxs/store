import {
  APP_INITIALIZER,
  Component,
  inject,
  Injectable,
  provideExperimentalZonelessChangeDetection
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { bootstrapApplication } from '@angular/platform-browser';
import { Action, provideStore, Selector, State, StateContext, Store } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { finalize } from 'rxjs';

describe('Select signal on provider levels', () => {
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
  class ComponentService {
    constructor() {
      const store = inject(Store);

      toObservable(store.selectSignal(NumberState.getNumber))
        .pipe(finalize(() => recorder.push('ComponentService:finalize')))
        .subscribe(value => {
          recorder.push(`ComponentService:value:${value}`);
        });
    }
  }

  @Component({
    selector: 'app-root',
    template: '',
    standalone: true,
    providers: [ComponentService]
  })
  class TestComponent {
    constructor(service: ComponentService) {}
  }

  it(
    'should allow having `selectSignal` on different provider levels',
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

      // Act
      store.dispatch(new Set(200));
      // Wait for a macrotask to ensure that all scheduled
      // microtasks (promises) are resolved.
      await new Promise(resolve => setTimeout(resolve, 0));

      appRef.destroy();

      // Assert
      expect(recorder).toEqual([
        'RootService:value:0',
        'ComponentService:value:0',
        'RootService:value:200',
        'ComponentService:value:200',
        'ComponentService:finalize',
        'RootService:finalize'
      ]);
    })
  );
});
