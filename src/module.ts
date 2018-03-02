import { NgModule, ModuleWithProviders, Optional, Inject } from '@angular/core';
import { REDUCER_TOKEN } from './symbols';
import { ReducerFactory } from './reducer-factory';
import { ActionStream } from './action-stream';
import { Store } from './store';
import { SelectFactory } from './select';
import { StateStream } from './state-stream';

@NgModule({})
export class NgxsModule {
  static forRoot(reducers: any[]): ModuleWithProviders {
    return {
      ngModule: NgxsModule,
      providers: [
        ReducerFactory,
        ActionStream,
        Store,
        StateStream,
        SelectFactory,
        {
          provide: REDUCER_TOKEN,
          useValue: reducers
        }
      ]
    };
  }

  static forFeature(reducers: any[]): ModuleWithProviders {
    return {
      ngModule: NgxsModule,
      providers: [ReducerFactory, ActionStream, Store, SelectFactory, StateStream]
    };
  }

  constructor(
    factory: ReducerFactory,
    store: Store,
    stateStream: StateStream,
    actionStream: ActionStream,
    select: SelectFactory,
    @Optional()
    @Inject(REDUCER_TOKEN)
    reducers: any[]
  ) {
    if (reducers) {
      const init = {};
      factory.add(reducers).forEach((meta: any) => {
        init[meta.namespace] = meta.initialState;
      });
      const cur = stateStream.getValue();
      stateStream.next({
        ...cur,
        ...init
      });
    }

    select.connect(store);
  }
}
