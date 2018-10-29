import { State, Selector } from '@ngxs/store';
import { ListModule } from './list.module';

@State({
  name: 'list',
  defaults: ['foo'],
  provideIn: ListModule
})
export class ListState {
  @Selector()
  static hello() {
    return 'hello';
  }
}
