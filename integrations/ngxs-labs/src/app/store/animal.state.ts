import { State, Selector, Action, StateContext } from '@ngxs/store';
import { ImmutableContext, ImmutableSelector } from '@ngxs-labs/immer-adapter';

export interface AnimalsStateModel {
  zebra: {
    food: string[];
    name: string;
  };
  panda: {
    food: string[];
    name: string;
  };
}

export class AddAnimal {
  static type = 'AddAnimal';
  constructor(public payload: string) {}
}

@State<AnimalsStateModel>({
  name: 'animals',
  defaults: {
    zebra: {
      food: [],
      name: 'zebra'
    },
    panda: {
      food: [],
      name: 'panda'
    }
  }
})
export class AnimalState {
  @Selector()
  @ImmutableSelector()
  public static zebraFood(state: AnimalsStateModel): string[] {
    return state.zebra.food.reverse();
  }

  @Action(AddAnimal)
  @ImmutableContext()
  public add({ setState }: StateContext<AnimalsStateModel>, { payload }: AddAnimal): void {
    setState((state: AnimalsStateModel) => {
      state.zebra.food.push(payload);
      return state;
    });
  }
}
