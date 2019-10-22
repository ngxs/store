import { Action, State, StateContext } from '@ngxs/store';
import {
  append,
  compose,
  iif,
  insertItem,
  patch,
  removeItem,
  updateItem
} from '@ngxs/store/operators';

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

export class ComposePanda {
  static readonly type = '[Animals] Compose panda';

  constructor(public payload: { zebras: string[]; pandas: string[] }) {}
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
      // $ExpectType PatchOperator<{ zebras: string[]; }>
      patch({
        // $ExpectType StateOperator<string[]>
        zebras: append([payload])
      })
    );
  }

  @Action(RemovePanda)
  removePanda(ctx: StateContext<AnimalsStateModel>, { payload }: RemovePanda) {
    ctx.setState(
      // $ExpectType PatchOperator<{ pandas: string[]; }>
      patch({
        // $ExpectType StateOperator<string[]>
        pandas: removeItem<string>(name => name === payload)
      })
    );
  }

  @Action(Test)
  test(ctx: StateContext<AnimalsStateModel>, { payload }: Test) {
    ctx.setState(
      // $ExpectType PatchOperator<{ pandas: string[]; }>
      patch({
        // $ExpectType StateOperator<string[]>
        pandas: insertItem<string>(payload)
      })
    );
  }

  @Action(ChangePandaName)
  changePandaName(ctx: StateContext<AnimalsStateModel>, { payload }: ChangePandaName) {
    ctx.setState(
      // $ExpectType PatchOperator<{ pandas: string[]; zebras: string[]; }>
      patch({
        // $ExpectType StateOperator<string[]>
        pandas: updateItem(name => name === payload.name, payload.newName),
        // $ExpectType StateOperator<string[]>
        zebras: iif(arr => arr!.length > 0, ['hello'], ['world'])
      })
    );
  }

  @Action(ComposePanda)
  composePanda(
    ctx: StateContext<AnimalsStateModel>,
    { payload: { zebras, pandas } }: ComposePanda
  ) {
    ctx.setState(
      // $ExpectType PatchOperator<{ zebras: string[]; pandas: string[]; }>
      patch({
        // $ExpectType StateOperator<string[]>
        zebras: compose(append(zebras)),
        // $ExpectType StateOperator<string[]>
        pandas: compose(append(pandas))
      })
    );
  }

  @Action({ type: 'patchExplicit' })
  patchExplicit(ctx: StateContext<AnimalsStateModel>) {
    ctx.setState(
      // $ExpectType PatchOperator<AnimalsStateModel>
      patch<AnimalsStateModel>({ zebras: [] })
    );
  }

  @Action({ type: 'patchImplicit' })
  patchImplicit(ctx: StateContext<AnimalsStateModel>) {
    ctx.setState(
      // $ExpectType PatchOperator<{ zebras: never[]; }>
      patch({ zebras: [] }) // $ExpectError
    );
  }
}
