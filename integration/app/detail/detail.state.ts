import { State } from 'ngxs';

@State({
  name: 'detail',
  defaults: { foo: true }
})
export class DetailState {}
