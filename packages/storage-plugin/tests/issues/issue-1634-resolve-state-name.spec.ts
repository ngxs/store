import { Injectable } from '@angular/core';
import { State, StateToken, NgxsModule, Action, StateContext, Store } from '@ngxs/store';
import { TestBed } from '@angular/core/testing';

import { NgxsStoragePluginModule } from '../../';

describe('Resolve state name if the state class has been provided (https://github.com/ngxs/store/issues/1634)', () => {
  it('should resolve state name if the state class has been provided', () => {
    // Arrange
    const COUNTRIES_STATE_TOKEN = new StateToken<string[]>('countries');

    class AddCountry {
      static type = '[Countries] Add country';
      constructor(public country: string) {}
    }

    @State({
      name: COUNTRIES_STATE_TOKEN,
      defaults: ['Mexico', 'USA', 'Canada']
    })
    @Injectable()
    class CountriesState {
      @Action(AddCountry)
      addCountry(ctx: StateContext<string[]>, action: AddCountry) {
        ctx.setState(state => [...state, action.country]);
      }
    }

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CountriesState]),
        NgxsStoragePluginModule.forRoot({
          key: [CountriesState]
        })
      ]
    });

    // Act
    const store = TestBed.inject(Store);
    store.dispatch(new AddCountry('France'));

    // Assert
    const countries = JSON.parse(localStorage.getItem('countries')!);
    expect(countries).toEqual(['Mexico', 'USA', 'Canada', 'France']);
  });
});
