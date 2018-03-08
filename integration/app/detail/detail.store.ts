import { Store } from 'ngxs';

@Store({
  name: 'detail',
  defaults: { foo: true },
})
export class DetailStore {}
