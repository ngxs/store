import { State } from '@ngxs/store';

@State({
  name: 'list',
  defaults: ['foo']
})
export class ListState {}
