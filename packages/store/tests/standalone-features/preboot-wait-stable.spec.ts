import { JsonPipe } from '@angular/common';
import {
  AfterViewInit,
  ApplicationRef,
  Component,
  Injectable,
  inject,
  ɵInitialRenderPendingTasks as PendingTasks,
  ChangeDetectionStrategy
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  Action,
  ActionStatus,
  Actions,
  State,
  StateContext,
  StateToken,
  dispatch,
  provideStore,
  select,
  withNgxsPreboot
} from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { first, firstValueFrom, takeUntil } from 'rxjs';

function executeRecipeFromDocs() {
  const appRef = inject(ApplicationRef);
  const pendingTasks = inject(PendingTasks);
  const actions$ = inject(Actions);

  const isStable$ = appRef.isStable.pipe(first(isStable => isStable));

  const actionToTaskIdMap = new Map<any, number>();

  actions$.pipe(takeUntil(isStable$)).subscribe(ctx => {
    if (ctx.status === ActionStatus.Dispatched) {
      const taskId = pendingTasks.add();
      actionToTaskIdMap.set(ctx.action, taskId);
    } else {
      const taskId = actionToTaskIdMap.get(ctx.action);
      if (typeof taskId === 'number') {
        pendingTasks.remove(taskId);
        actionToTaskIdMap.delete(ctx.action);
      }
    }
  });
}

describe('preboot feature + stable', () => {
  const COUNTRIES_STATE_TOKEN = new StateToken<string[]>('countries');

  class AddCountry {
    static type = '[Countries] Add country';
    constructor(public country: string) {}
  }

  @State({
    name: COUNTRIES_STATE_TOKEN,
    defaults: ['Angola', 'Namibia', 'Botswana']
  })
  @Injectable()
  class CountriesState {
    @Action(AddCountry)
    async addCountry(ctx: StateContext<string[]>, action: AddCountry) {
      await new Promise(resolve => setTimeout(resolve, 0));
      ctx.setState(state => [...state, action.country]);
    }
  }

  @Component({
    selector: 'app-root',
    template: `<div>{{ countries() | json }}</div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [JsonPipe]
  })
  class TestComponent implements AfterViewInit {
    countries = select(COUNTRIES_STATE_TOKEN);

    private addCountry = dispatch(AddCountry);

    ngAfterViewInit(): void {
      this.addCountry('Zambia');
    }
  }

  it(
    'should wait for app to become stable',
    freshPlatform(async () => {
      // Arrange
      const appRef = await skipConsoleLogging(() =>
        bootstrapApplication(TestComponent, {
          providers: [provideStore([CountriesState], withNgxsPreboot(executeRecipeFromDocs))]
        })
      );

      // Act
      await firstValueFrom(appRef.isStable.pipe(first(isStable => isStable)));

      // Assert
      const div = document.querySelector('div')!;
      const countries = JSON.parse(div.innerHTML);
      // Check whether view is synced with the state.
      expect(countries).toEqual(['Angola', 'Namibia', 'Botswana', 'Zambia']);
    })
  );
});
