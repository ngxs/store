import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Actions, NgxsModule, Store } from '@ngxs/store';
import { NgxsResetPluginModule, StateErase, StateReset } from '../';
import { AppState, PreferencesState, SessionState, ToDoState } from './test-states';
import { SessionEnd, ToDoAdd } from './test-symbols';

interface TestModel {
  actions$: Actions;
  store: Store;
}

describe('NgxsResetPlugin', () => {
  it('should erase states on StateErase', fakeAsync(() => {
    const { store } = setupTest();

    store.dispatch(new StateErase());
    tick();

    expect(store.snapshot()).toEqual({});
  }));

  it('should erase states on StateErase but keep selected', fakeAsync(() => {
    const { store } = setupTest();

    store.dispatch(new StateErase(PreferencesState));
    tick();

    expect(store.snapshot()).toEqual({
      app: { preferences: { darkmode: false, language: 'en' } }
    });
  }));

  it('should erase states on StateErase but keep selected (multi)', fakeAsync(() => {
    const { store } = setupTest();

    const lastseen = ensureLastSeen(store);

    store.dispatch(new StateErase([PreferencesState, SessionState]));
    tick();

    expect(store.snapshot()).toEqual({
      app: { preferences: { darkmode: false, language: 'en' }, session: { lastseen } }
    });
  }));

  it('should reset state to defaults on StateReset', fakeAsync(() => {
    const { store } = setupTest();

    store.dispatch(new StateReset(ToDoState));
    tick();

    expect(store.selectSnapshot(ToDoState.list)).toEqual([]);
  }));

  it('should reset state to defaults on StateReset (multi)', fakeAsync(() => {
    const { store } = setupTest();

    ensureLastSeen(store);

    store.dispatch(new StateReset([SessionState, ToDoState]));
    tick();

    expect(store.selectSnapshot(SessionState)).toBeUndefined();
    expect(store.selectSnapshot(ToDoState.list)).toEqual([]);
  }));

  it('should log a warning on StateReset with wrong payload', fakeAsync(() => {
    const { store } = setupTest();
    const state = store.snapshot();

    console.warn = jasmine.createSpy('warning');

    store.dispatch(new StateReset(ToDoAdd));
    tick();

    expect(console.warn).toHaveBeenCalled();
    expect(store.snapshot()).toEqual(state);
  }));
});

function ensureLastSeen(store: Store): number {
  const lastseen = new Date().valueOf();

  store.dispatch(new SessionEnd(lastseen));
  tick();

  expect(store.selectSnapshot(SessionState)).toEqual({ lastseen });

  return lastseen;
}

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
