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
  select,
  withNgxsPendingTasks
} from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

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
      const html = await skipConsoleLogging(() =>
        renderApplication(
          () =>
            bootstrapApplication(TestComponent, {
              providers: [
                provideExperimentalZonelessChangeDetection(),

                provideStore([CountriesState], withNgxsPendingTasks())
              ]
            }),
          {
            document: '<app-root></app-root>',
            url: '/'
          }
        )
      );

      // Assert
      // Replace `ng-version="19.0.0"` to avoid updating the snapshot every time
      // we bump the Angular version.
      expect(html.replace(/ng-version="(\d+\.\d+\.\d+)"/, '')).toMatchSnapshot();
    })
  );
});
