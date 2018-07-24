import { State, Action, StateContext } from '@ngxs/store';
import { {{pascalCase name}}Action } from './{{dashCase name}}.actions';

export class {{pascalCase name}}StateModel {
  public items: string[];
}

@State<{{pascalCase name}}StateModel>({
  name: '{{camelCase name}}',
  defaults: {
    items: []
  }
})
export class {{pascalCase name}}State {
  @Action({{pascalCase name}}Action)
  add(ctx: StateContext<{{pascalCase name}}StateModel>, action: {{pascalCase name}}Action) {
    const state = ctx.getState();
    ctx.setState({ items: [ ...state.items, action.payload ] });
  }
}
