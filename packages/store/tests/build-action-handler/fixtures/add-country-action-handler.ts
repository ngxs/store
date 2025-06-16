import { ActionDirector } from '@ngxs/store';

import { COUNTRIES_STATE_TOKEN } from './state';
import { AddCountry } from './actions';

export const addCountryActionHandler = (actionDirector: ActionDirector) => {
  actionDirector.attachAction(COUNTRIES_STATE_TOKEN, AddCountry, (ctx, action) => {
    ctx.setState(countries => [...countries, action.country]);
  });
};
