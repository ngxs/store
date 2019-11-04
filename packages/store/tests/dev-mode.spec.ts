import { Injectable, ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Action } from '../src/decorators/action';
import { State } from '../src/decorators/state';
import { InitState, UpdateState } from '../src/actions/actions';

import { NgxsModule } from '../src/module';
import { Store } from '../src/store';
import { StateContext } from '../src/symbols';
import { Selector } from '../src/decorators/selector/selector';

import { NoopErrorHandler } from './helpers/utils';

describe('Development Mode', () => {
  class Increment {
    static type = 'INCREMENT';
    constructor(public amount: number = 1) {}
  }

  interface StateModel {
    count: number;
  }

  describe('(when disabled)', () => {
    it('should not give errors for normal operation', () => {
      @State<StateModel>({
        name: 'counter',
        defaults: { count: 0 }
      })
      class MyStore {
        @Action(Increment)
        increment({ getState, setState }: StateContext<StateModel>, { amount }: Increment) {
          setState({ count: Number(getState().count) + amount });
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyStore], { developmentMode: false })]
      });

      const store: Store = TestBed.get(Store);
      const observedCallbacks: string[] = [];

      store.dispatch(new Increment()).subscribe({
        next: () => observedCallbacks.push('next'),
        error: error => observedCallbacks.push('error: ' + error),
        complete: () => observedCallbacks.push('complete')
      });

      expect(observedCallbacks).toEqual(['next', 'complete']);
    });

    it('should not give an error if the default state is mutated by a handler', () => {
      @State<StateModel>({
        name: 'counter',
        defaults: { count: 0 }
      })
      class MyStore {
        @Action(Increment)
        mutatingIncrement(
          { getState, setState }: StateContext<StateModel>,
          { amount }: Increment
        ) {
          const state = getState();
          state.count = Number(getState().count) + amount;
          setState(state);
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyStore], { developmentMode: false })],
        providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
      });

      const store: Store = TestBed.get(Store);
      const observedCallbacks: string[] = [];

      store.dispatch(new Increment()).subscribe({
        next: () => observedCallbacks.push('next'),
        error: error => observedCallbacks.push('error: ' + error),
        complete: () => observedCallbacks.push('complete')
      });

      expect(observedCallbacks).toEqual(['next', 'complete']);
    });
  });

  describe('(when enabled)', () => {
    it('should not give errors for normal operation', () => {
      @State<StateModel>({
        name: 'counter',
        defaults: { count: 0 }
      })
      class MyStore {
        @Action(Increment)
        increment({ getState, setState }: StateContext<StateModel>, { amount }: Increment) {
          setState({ count: Number(getState().count) + amount });
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyStore], { developmentMode: true })]
      });

      const store: Store = TestBed.get(Store);
      const observedCallbacks: string[] = [];

      store.dispatch(new Increment()).subscribe({
        next: () => observedCallbacks.push('next'),
        error: error => observedCallbacks.push('error: ' + error),
        complete: () => observedCallbacks.push('complete')
      });

      expect(observedCallbacks).toEqual(['next', 'complete']);
    });

    it('should give an error if the default state is mutated by the InitState action', () => {
      @State<StateModel>({
        name: 'counter',
        defaults: { count: 0 }
      })
      class MyStore {
        @Action(InitState)
        init({ getState, setState }: StateContext<StateModel>) {
          const state = getState();
          state.count = Number(getState().count) + 1;
          setState(state);
        }
      }

      const observedErrors: string[] = [];
      @Injectable()
      class CustomErrorHandler implements ErrorHandler {
        handleError(error: any) {
          observedErrors.push('error: ' + error);
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyStore], { developmentMode: true })],
        providers: [
          {
            provide: ErrorHandler,
            useClass: CustomErrorHandler
          }
        ]
      });
      TestBed.get(Store);

      expect(observedErrors).toEqual([
        `error: TypeError: Cannot assign to read only property 'count' of object '[object Object]'`
      ]);
    });

    it('should give an error if the default state is mutated by the UpdateState action', () => {
      @State<StateModel>({
        name: 'counter',
        defaults: { count: 0 }
      })
      class MyStore {
        @Action(UpdateState)
        updateState({ getState, setState }: StateContext<StateModel>) {
          const state = getState();
          state.count = Number(getState().count) + 1;
          console.log('blah');
          setState(state);
        }
      }

      const observedErrors: string[] = [];
      @Injectable()
      class CustomErrorHandler implements ErrorHandler {
        handleError(error: any) {
          observedErrors.push('error: ' + error);
        }
      }

      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([], { developmentMode: true }),
          NgxsModule.forFeature([MyStore])
        ],
        providers: [
          {
            provide: ErrorHandler,
            useClass: CustomErrorHandler
          }
        ]
      });
      TestBed.get(Store);

      expect(observedErrors).toEqual([
        `error: TypeError: Cannot assign to read only property 'count' of object '[object Object]'`
      ]);
    });

    it('should give an error if the default state is mutated by a handler', () => {
      @State<StateModel>({
        name: 'counter',
        defaults: { count: 0 }
      })
      class MyStore {
        @Action(Increment)
        mutatingIncrement(
          { getState, setState }: StateContext<StateModel>,
          { amount }: Increment
        ) {
          const state = getState();
          state.count = Number(getState().count) + amount;
          setState(state);
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyStore], { developmentMode: true })],
        providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
      });

      const store: Store = TestBed.get(Store);
      const observedCallbacks: string[] = [];

      store.dispatch(new Increment()).subscribe({
        next: () => observedCallbacks.push('next'),
        error: error => observedCallbacks.push('error: ' + error),
        complete: () => observedCallbacks.push('complete')
      });

      expect(observedCallbacks).toEqual([
        `error: TypeError: Cannot assign to read only property 'count' of object '[object Object]'`
      ]);
    });

    it('should give an error if the state is mutated by a handler', () => {
      class Reset {
        static type = 'RESET';
      }

      @State<StateModel>({
        name: 'counter',
        defaults: { count: 0 }
      })
      class MyStore {
        @Action(Reset)
        reset({ setState }: StateContext<StateModel>) {
          setState({ count: 0 });
        }

        @Action(Increment)
        mutatingIncrement(
          { getState, setState }: StateContext<StateModel>,
          { amount }: Increment
        ) {
          const state = getState();
          state.count = Number(getState().count) + amount;
          setState(state);
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyStore], { developmentMode: true })],
        providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
      });

      const store: Store = TestBed.get(Store);
      const observedCallbacks: string[] = [];

      store.dispatch(new Reset());
      store.dispatch(new Increment()).subscribe({
        next: () => observedCallbacks.push('next'),
        error: error => observedCallbacks.push('error: ' + error),
        complete: () => observedCallbacks.push('complete')
      });

      expect(observedCallbacks).toEqual([
        `error: TypeError: Cannot assign to read only property 'count' of object '[object Object]'`
      ]);
    });

    it('should give an error if the state returned by a store select is mutated', () => {
      @State<StateModel>({
        name: 'counter',
        defaults: { count: 0 }
      })
      class MyStore {
        @Selector()
        static getCount(state: StateModel): number {
          return state.count;
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyStore], { developmentMode: true })],
        providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
      });

      const store: Store = TestBed.get(Store);

      // todo: remove any
      store.select<StateModel>(<any>MyStore).subscribe((state: StateModel) => {
        try {
          state.count++;
        } catch (error) {
          expect('error: ' + error).toEqual(
            `error: TypeError: Cannot assign to read only property 'count' of object '[object Object]'`
          );
        }
      });
    });

    it('should give an error if the state returned by a selector is mutated', () => {
      @State<{ inner: StateModel }>({
        name: 'counter',
        defaults: { inner: { count: 0 } }
      })
      class MyStore {
        @Selector()
        static getCounterModel(state: { inner: StateModel }): StateModel {
          return state.inner;
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyStore], { developmentMode: true })],
        providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
      });

      const store: Store = TestBed.get(Store);

      store.select(MyStore.getCounterModel).subscribe((state: StateModel) => {
        try {
          state.count++;
        } catch (error) {
          expect('error: ' + error).toEqual(
            `error: TypeError: Cannot assign to read only property 'count' of object '[object Object]'`
          );
        }
      });
    });

    it('should give an error if a state snapshot is mutated', () => {
      @State<StateModel>({
        name: 'counter',
        defaults: { count: 0 }
      })
      class MyStore {}

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyStore], { developmentMode: true })],
        providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
      });

      const store: Store = TestBed.get(Store);

      const state = store.selectSnapshot<StateModel>(appState => appState.counter);
      try {
        state.count++;
      } catch (error) {
        expect('error: ' + error).toEqual(
          `error: TypeError: Cannot assign to read only property 'count' of object '[object Object]'`
        );
      }
    });

    xit('should give an error if the action is mutated by a handler', () => {
      @State<StateModel>({
        name: 'counter',
        defaults: { count: 0 }
      })
      class MyStore {
        @Action(Increment)
        mutatingIncrement(
          { getState, setState }: StateContext<StateModel>,
          action: Increment
        ) {
          action.amount++;
          setState({ count: Number(getState().count) + action.amount });
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyStore], { developmentMode: true })],
        providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
      });

      const store: Store = TestBed.get(Store);
      const observedCallbacks: string[] = [];

      store.dispatch(new Increment()).subscribe({
        next: () => observedCallbacks.push('next'),
        error: error => observedCallbacks.push('error: ' + error),
        complete: () => observedCallbacks.push('complete')
      });

      expect(observedCallbacks).toEqual([
        `error: TypeError: Cannot assign to read only property 'amount' of object '[object Object]'`
      ]);
    });

    xit('should give an error if a child action is mutated by a handler', () => {
      class Start {
        static type = 'START';
      }

      @State<StateModel>({
        name: 'counter',
        defaults: { count: 0 }
      })
      class MyStore {
        @Action(Start)
        start({ dispatch }: StateContext<StateModel>) {
          return dispatch(new Increment());
        }

        @Action(Increment)
        mutatingIncrement(
          { getState, setState }: StateContext<StateModel>,
          action: Increment
        ) {
          action.amount++;
          setState({ count: Number(getState().count) + action.amount });
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyStore], { developmentMode: true })],
        providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
      });

      const store: Store = TestBed.get(Store);
      const observedCallbacks: string[] = [];

      store.dispatch(new Start()).subscribe({
        next: () => observedCallbacks.push('next'),
        error: error => observedCallbacks.push('error: ' + error),
        complete: () => observedCallbacks.push('complete')
      });

      expect(observedCallbacks).toEqual([
        `error: TypeError: Cannot assign to read only property 'amount' of object '[object Object]'`
      ]);
    });
  });
});
