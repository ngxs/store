import { Action, State, StateContext } from '@ngxs/store';
import { DetailModule } from './detail.module';
import { DetailFooActions } from './detail.actions';

export interface DetailStateModel {
  foo: boolean;
}

@State<DetailStateModel>({
  name: 'detail',
  defaults: { foo: true },
  providedIn: DetailModule
})
export class DetailState {
  @Action(DetailFooActions)
  changeFoo(ctx: StateContext<DetailStateModel>, { foo }: DetailFooActions) {
    ctx.setState({ foo });
  }
}
