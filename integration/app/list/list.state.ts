import { State, Selector } from '@ngxs/store';

@State({
  name: 'list',
  defaults: ['foo']
})
export class ListState {
  @Selector()
  static hello() {
    return 'hello';
  }
}
