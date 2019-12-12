import { State, StateContext } from '@ngxs/store';
import { Receiver } from '@ngxs-labs/emitter';

@State<number>({
  name: 'counterEmitter',
  defaults: 0
})
export class CounterEmitterState {
  @Receiver()
  public static increment({ setState, getState }: StateContext<number>) {
    setState(getState() + 1);
  }

  @Receiver()
  public static decrement({ setState, getState }: StateContext<number>) {
    setState(getState() - 1);
  }
}
