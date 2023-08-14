import { Action, Selector, State, StateContext } from '@ngxs/store';
import { DictionaryReset, SetDictionaryData } from './dictionary.actions';

export interface DictionaryStateModel {
  content: any[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

@State<DictionaryStateModel>({
  name: 'dictionary',
  defaults: {
    content: [],
    page: 0,
    size: 0,
    totalPages: 0,
    totalElements: 0
  }
})
export class DictionaryState {
  @Selector()
  public static getDictionaryState(state: DictionaryStateModel): DictionaryStateModel {
    return DictionaryState.getInstanceState(state);
  }

  @Selector()
  public static getDictionaryContent(state: DictionaryStateModel) {
    return state.content;
  }

  private static setInstanceState(state: DictionaryStateModel): DictionaryStateModel {
    return { ...state };
  }

  private static getInstanceState(state: DictionaryStateModel): DictionaryStateModel {
    return { ...state };
  }

  @Action(SetDictionaryData)
  public setTasks(
    { setState }: StateContext<DictionaryStateModel>,
    { payload }: SetDictionaryData
  ) {
    setState(DictionaryState.setInstanceState(payload));
  }

  @Action(DictionaryReset)
  public resetTasks({ setState }: StateContext<DictionaryStateModel>) {
    const initialState = {
      content: [],
      page: 0,
      size: 0,
      totalPages: 0,
      totalElements: 0
    };
    setState(initialState);
  }
}
