import { StateContext } from './symbols';

export abstract class StateBase<StateModel> {
  public ctx: StateContext<StateModel> = null; // gets set in StateFactory
}
