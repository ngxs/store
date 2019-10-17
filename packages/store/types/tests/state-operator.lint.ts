import { State, Action, StateContext } from '@ngxs/store';
import { patch, append, removeItem, insertItem, updateItem } from '@ngxs/store/operators';

export interface AnimalsStateModel {
  zebras: string[];
  pandas: string[];
}

export class AddZebra {
  static readonly type = '[Animals] Add zebra';

  constructor(public payload: string) {}
}

export class RemovePanda {
  static readonly type = '[Animals] Remove panda';

  constructor(public payload: string) {}
}

export class Test {
  static readonly type = '[Animals] test';

  constructor(public payload: string) {}
}

export class ChangePandaName {
  static readonly type = '[Animals] Change panda name';

  constructor(public payload: { name: string; newName: string }) {}
}

@State<AnimalsStateModel>({
  name: 'animals',
  defaults: {
    zebras: ['Jimmy', 'Jake', 'Alan'],
    pandas: ['Michael', 'John']
  }
})
export class AnimalsState {
  @Action(AddZebra)
  addZebra(ctx: StateContext<AnimalsStateModel>, { payload }: AddZebra) {
    ctx.setState(
      patch({
        zebras: append([payload]) // $ExpectError
      })
    );
  }

  @Action(RemovePanda)
  removePanda(ctx: StateContext<AnimalsStateModel>, { payload }: RemovePanda) {
    ctx.setState(
      patch({
        pandas: removeItem<string>(name => name === payload) // $ExpectError
      })
    );
  }

  @Action(Test)
  test(ctx: StateContext<AnimalsStateModel>, { payload }: Test) {
    ctx.setState(
      patch({
        pandas: insertItem<string>(payload) // $ExpectError
      })
    );
  }

  @Action(ChangePandaName)
  changePandaName(ctx: StateContext<AnimalsStateModel>, { payload }: ChangePandaName) {
    ctx.setState(
      patch({
        pandas: updateItem<string>(name => name === payload.name, payload.newName)
      })
    );
  }
}
