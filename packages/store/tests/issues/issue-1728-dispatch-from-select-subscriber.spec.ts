import { Action, StateContext, Selector, State, NgxsModule, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

interface DataStateModel {
  data: string;
}

class SetDataState {
  static readonly type = '[DataState] Set Data';
  constructor(public dataRequest: string) {}
}

class FixDataState {
  static readonly type = '[DataState] Fix Data';
  constructor(public newState: DataStateModel) {}
}

@State<DataStateModel>({
  name: 'DataState',
  defaults: {
    data: ''
  }
})
@Injectable()
class DataState {
  @Selector()
  static getData(state: DataStateModel) {
    return state.data;
  }

  @Action(FixDataState)
  fixData(ctx: StateContext<DataStateModel>, { newState }: FixDataState) {
    ctx.setState(newState);
  }

  @Action(SetDataState)
  getData(ctx: StateContext<DataStateModel>, { dataRequest }: SetDataState) {
    const fixedData = dataRequest === 'TAKE BROKEN DATA' ? 'BAD-DATA' : 'GOOD-DATA';
    return new Promise(resolve => {
      setTimeout(() => {
        ctx.setState({ data: fixedData });
        resolve();
      });
    });
  }
}

interface StatusStateModel {
  counter: number;
  status: string;
}

class SetStatusState {
  static readonly type = '[StatusState] Set Status';
  constructor(public status: string) {}
}

@State<StatusStateModel>({
  name: 'StatusState',
  defaults: {
    counter: 0,
    status: ''
  }
})
@Injectable()
class StatusState {
  @Selector()
  static getStatus(state: StatusStateModel) {
    return state.status;
  }

  @Action(SetStatusState)
  setState(ctx: StateContext<StatusStateModel>, action: SetStatusState) {
    const state = ctx.getState();
    ctx.setState({
      status: action.status,
      counter: state.counter + 1
    });
  }
}

describe('Dispatch from select subscriber (https://github.com/ngxs/store/issues/1728)', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([DataState, StatusState])]
    });

    const recorder: string[] = [];
    const store = TestBed.inject(Store);
    const record = (message: string) => recorder.push(message);
    return { store, record, recorder };
  }

  it('should not receive an old value', async () => {
    // Arrange
    const { store, record, recorder } = setup();

    store.select(DataState).subscribe(state => {
      const isValid = state.data !== 'BAD-DATA';
      record(`DataState subscription: data = ${state.data}, isValid = ${isValid}`);
      const action = new SetStatusState(isValid ? 'good' : 'bad');
      store.dispatch(action);
    });

    store.select(StatusState).subscribe(state => {
      record(`StatusState subscription: ${state.status}`);
    });

    // Act
    await store.dispatch(new SetDataState('TAKE BROKEN DATA')).toPromise();

    // This is how `recorder` looked like before we added the `observeOn(queueScheduler)` to the `_selectableStateStream`:
    // [
    //   'DataState subscription: data = , isValid = true',
    //   'StatusState subscription: good',
    //   'DataState subscription: data = BAD-DATA, isValid = false',
    //   'StatusState subscription: bad',
    //   'StatusState subscription: good'
    // ]

    // Assert
    expect(recorder).toEqual([
      'DataState subscription: data = , isValid = true',
      'StatusState subscription: good',
      'DataState subscription: data = BAD-DATA, isValid = false',
      'StatusState subscription: bad'
    ]);
  });
});
