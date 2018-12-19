import { State, Selector } from '@ngxs/store';

@State({
  name: 'list',
  defaults: ['foo']
})
export class ListState {
  @Selector()
  public static hello(): string {
    return 'hello';
  }
}
