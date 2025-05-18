import { inject } from '@angular/core';
import { ActionDirector } from '@ngxs/store';

import { COUNTRIES_STATE_TOKEN } from './state';
import { AddCountry } from './actions';

export const addCountryActionHandler = () => {
  const actionDirector = inject(ActionDirector);

  actionDirector.attachAction(COUNTRIES_STATE_TOKEN, AddCountry, (ctx, action) => {
    ctx.setState(countries => [...countries, action.country]);
  });
};
