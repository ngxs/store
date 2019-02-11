import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Actions, NgxsModule, Store } from '@ngxs/store';
import { NgxsResetPluginModule } from '../';
import { AppState, PreferencesState, SessionState, ToDoState } from './test-states';
import { ToDoAdd } from './test-symbols';

interface TestModel {
  actions$: Actions;
  store: Store;
}

describe('NgxsResetPlugin', () => {
  it('should be ready for testing', fakeAsync(() => {
    setupTest();
  }));
});

function setupTest(): TestModel {
  TestBed.configureTestingModule({
    imports: [
      NgxsModule.forRoot([AppState, PreferencesState, SessionState, ToDoState]),
      NgxsResetPluginModule.forRoot()
    ]
  });

  const actions$ = TestBed.get(Actions);
  const store = TestBed.get(Store);

  store.dispatch(new ToDoAdd('Test'));

  tick();
  expect(store.selectSnapshot(ToDoState.list)).toEqual([{ description: 'Test', done: false }]);

  return { actions$, store };
}
