import { State } from '../../src/decorators/state';
import { Action } from '../../src/decorators/action';
import { Freeze } from '../../src/decorators/freeze';
import { unfreeze } from '../../src/utils/unfreeze';

class Period {
  public id: number;
  public startDate: Date;
  public endDate: Date;
}

export class Application {
  public id: number;
  public periods: Period[] = [];
}

@Freeze()
export class ApplicationShallowFrozen {
  static type = '[ApplicationShallowFrozen]';

  constructor(public payload: Application) {
  }
}

@Freeze({ deep: true })
export class ApplicationDeepFrozen {
  static type = '[ApplicationDeepFrozen]';

  constructor(public payload: Application) {
  }
}

@Freeze({ deep: true })
export class PeriodDeepFrozen {
  static type = '[PeriodDeepFrozen]';

  constructor(public payload: Period) {
  }
}

@State<Application>({
  name: 'applicationState',
  defaults: new Application()
})
export class ApplicationState {
  @Action(PeriodDeepFrozen)
  public setPeriod({ getState, setState }, { payload }: PeriodDeepFrozen) {
    payload.startDate = new Date(1970); // Cannot assign to read only property
    payload.endDate = new Date(1970); // Cannot assign to read only property
    setState({ ...getState(), ...unfreeze(payload) }); // can't works
  }

  @Action(ApplicationShallowFrozen)
  public setApplicationFirst({ getState, setState }, action: ApplicationShallowFrozen) {
    action.payload = null; // shallow mutate (change reference)
    setState({ ...getState(), ...action.payload }); // can't works
  }

  @Action(ApplicationShallowFrozen)
  public setApplicationSecond({ getState, setState }, { payload }: ApplicationShallowFrozen) {
    payload.id = 100; // deep mutate in payload
    payload.periods = []; // deep mutate in payload
    setState({ ...getState(), ...payload }); // can works
  }

  @Action(ApplicationDeepFrozen)
  public setApplicationThirty({ getState, setState }, { payload }: ApplicationDeepFrozen) {
    setState({ ...getState(), ...unfreeze(payload) }); // can works
  }
}
