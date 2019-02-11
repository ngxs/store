import { Action, Selector, State, StateContext } from '@ngxs/store';
import { App, Preferences, Session, SessionEnd, ToDo, ToDoAdd } from './test-symbols';

/**
 * Test ToDoState
 */
@State<ToDo.State>({
  name: 'todos',
  defaults: {
    list: []
  }
})
export class ToDoState {
  @Selector()
  static list({ list }: ToDo.State): ToDo.Item[] {
    return list;
  }

  @Action(ToDoAdd)
  addNewTodo({ getState, setState }: StateContext<ToDo.State>, { payload }: ToDoAdd) {
    const state = getState();
    setState({
      list: [
        ...state.list,
        {
          description: payload,
          done: false
        }
      ]
    });
  }
}

/**
 * Test PreferencesState
 */
@State<Preferences.State>({
  name: 'preferences',
  defaults: {
    darkmode: false,
    language: 'en'
  }
})
export class PreferencesState {}

/**
 * Test SessionState
 */
@State<Session.State>({
  name: 'session'
})
export class SessionState {
  @Action(SessionEnd)
  updateLastSeen({ patchState }: StateContext<Session.State>, { payload }: SessionEnd) {
    patchState({
      lastseen: payload
    });
  }
}

/**
 * Test AppState
 */
@State<App.State>({
  name: 'app',
  defaults: {
    status: 'ONLINE'
  },
  children: [PreferencesState, SessionState, ToDoState]
})
export class AppState {}
