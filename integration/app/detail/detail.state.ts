import { State } from '@ngxs/store';

@State({
  name: 'detail',
  defaults: { foo: true }
})
export class DetailState {}
