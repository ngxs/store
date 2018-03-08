import { Store } from 'ngxs';

@Store({
  name: 'list',
  defaults: ['foo']
})
export class ListStore {}
