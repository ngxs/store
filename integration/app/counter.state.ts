import { DispatchAction, Dispatcher, State } from '@ngxs/store';
import { Injector } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

export interface CounterStateModel {
  value: number;
}

@State<CounterStateModel>({
  name: 'counter',
  defaults: { value: 0 }
})
export class CounterState {
  public static injector: Injector;

  constructor(injector: Injector) {
    CounterState.injector = injector;
  }

  @Dispatcher()
  public static setValue({ setState }, { payload }: DispatchAction<number>) {
    setState({ value: payload });
  }

  @Dispatcher()
  public static loadData({ setState }) {
    const apiService = CounterState.injector.get(ApiService);
    return apiService.getValueFromServer().pipe(tap((value: number) => setState({ value })));
  }
}
