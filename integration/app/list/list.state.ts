import { State, Selector } from '@ngxs/store';
import { ListModule } from './list.module';

@State({
  name: 'list',
  defaults: ['foo'],
  providedIn: ListModule
})
export class ListState {
  @Selector()
  static hello() {
    return 'hello';
  }
}
