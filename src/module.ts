import { NgModule, ModuleWithProviders, Optional, Inject } from '@angular/core';
import { REDUCER_TOKEN } from './symbols';
import { ReducerFactory } from './reducer-factory';
import { ActionStream } from './action-stream';
import { Store } from './store';
import { SelectFactory } from './select';
import { startWith } from 'rxjs/operators';
import { InitState } from './actions';

@NgModule({})
export class NgxsModule {
  static forRoot(reducers: any[]): ModuleWithProviders {
    return {
      ngModule: NgxsModule,
      providers: [
        ReducerFactory,
        ActionStream,
        Store,
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
      providers: [
        ReducerFactory,
        ActionStream,
        Store,
        SelectFactory
      ]
    };
  }

  constructor(
    factory: ReducerFactory,
      store: Store,
      actionStream: ActionStream,
    select: SelectFactory,
    @Optional() @Inject(REDUCER_TOKEN) reducers: any[]) {
        const init = {};
        factory.add(reducers).forEach(meta => {
            init[meta.namespace] = meta.initialState;
        });
        const cur = actionStream.getValue();
        actionStream.next(new InitState({
            ...cur,
            ...init
        }));
        select.connect(store);
  }
}
