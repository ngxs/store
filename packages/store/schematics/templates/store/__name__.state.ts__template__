import { State, Action, Selector, StateContext } from '@ngxs/store';
import { <%= classify(name) %>Action } from './<%= dasherize(name) %>.actions';

export interface <%= classify(name) %>StateModel {
  items: string[];
}

@State<<%= classify(name) %>StateModel>({
  name: '<%= camelize(name) %>',
  defaults: {
    items: []
  }
})
export class <%= classify(name) %>State {

  @Selector()
  public static getState(state: <%= classify(name) %>StateModel) {
    return state;
  }

  @Action(<%= classify(name) %>Action)
  public add(ctx: StateContext<<%= classify(name) %>StateModel>, { payload }: <%= classify(name) %>Action) {
    const stateModel = ctx.getState();
    stateModel.items = [...stateModel.items, payload];
    ctx.setState(stateModel);
  }
}
