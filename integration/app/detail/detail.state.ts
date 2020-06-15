import { State } from '@ngxs/store';
import { Injectable } from '@angular/core';

@State({
  name: 'detail',
  defaults: { foo: true }
})
@Injectable()
export class DetailState {}
