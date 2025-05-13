import { experimentalBuildActionHandler, StateContext } from '@ngxs/store';

import { CountriesState } from './state';
import { AddCountry } from './actions';

export const addCountryActionHandler = experimentalBuildActionHandler(
  CountriesState,
  AddCountry,
  (ctx: StateContext<string[]>, action: AddCountry) => {
    ctx.setState(countries => [...countries, action.country]);
  }
);
