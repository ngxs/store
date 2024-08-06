import { JsonPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Injectable,
  provideExperimentalZonelessChangeDetection,
  ChangeDetectionStrategy
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import {
  Action,
  State,
  StateContext,
  StateToken,
  dispatch,
  provideStore,
  select
} from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';
import { withExperimentalNgxsPendingTasks } from '@ngxs/store/experimental';

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
              provideExperimentalZonelessChangeDetection(),

              provideStore([CountriesState], withExperimentalNgxsPendingTasks())
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
