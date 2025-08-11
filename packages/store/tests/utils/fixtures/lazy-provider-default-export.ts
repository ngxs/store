import { Injectable } from '@angular/core';
import { provideStates, State } from '@ngxs/store';

@State({
  name: 'products',
  defaults: []
})
@Injectable()
class ProductsState {}

const productsStateProvider = provideStates([ProductsState]);

export default productsStateProvider;
