import { State } from 'ngxs';

@State({
  name: 'list',
  defaults: ['foo']
})
export class ListState {}
