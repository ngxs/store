import { Injectable } from '@angular/core';
import { State, StateToken } from '@ngxs/store';

export const COUNTRIES_STATE_TOKEN = new StateToken<string[]>('countries');

@State<string[]>({
  name: COUNTRIES_STATE_TOKEN,
  defaults: []
})
@Injectable()
export class CountriesState {}
