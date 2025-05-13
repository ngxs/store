import { Injectable } from '@angular/core';
import { State } from '@ngxs/store';

@State<string[]>({
  name: 'countries',
  defaults: []
})
@Injectable()
export class CountriesState {}
