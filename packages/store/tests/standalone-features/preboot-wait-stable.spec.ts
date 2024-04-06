import { JsonPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Injectable,
  inject,
  ɵPendingTasks as PendingTasks,
  ɵprovideZonelessChangeDetection,
  ChangeDetectionStrategy
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
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
import { freshPlatform } from '@ngxs/store/internals/testing';

function executeRecipeFromDocs() {
  const pendingTasks = inject(PendingTasks);
  const actions$ = inject(Actions);

  const actionToTaskIdMap = new Map<any, number>();

  actions$.subscribe(ctx => {
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
      const html = await renderApplication(
        () =>
          bootstrapApplication(TestComponent, {
            providers: [
              ɵprovideZonelessChangeDetection(),

              provideStore([CountriesState], withNgxsPreboot(executeRecipeFromDocs))
            ]
          }),
        {
          document: '<app-root></app-root>',
          url: '/'
        }
      );

      // Assert
      expect(html).toMatchSnapshot();
    })
  );
});
