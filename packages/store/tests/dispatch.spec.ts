import { async, TestBed } from '@angular/core/testing';
import { timer } from 'rxjs/observable/timer';
import { tap, skip, delay } from 'rxjs/operators';

import { State } from '../src/state';
import { Action } from '../src/action';
import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { StateContext } from '../src/symbols';
import { of } from 'rxjs/observable/of';

describe('Dispatch', () => {
  class Increment {
    static type = 'INCREMENT';
  }

  class Decrement {
    static type = 'DECREMENT';
  }

  it(
    'should correctly dispatch the event',
    async(() => {
      @State<number>({
        name: 'counter',
        defaults: 0
      })
      class MyState {
        @Action(Increment)
        increment({ getState, setState }: StateContext<number>) {
          setState(getState() + 1);
        }

        @Action(Decrement)
        decrement({ getState, setState }: StateContext<number>) {
          setState(getState() - 1);
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);

      store.dispatch(new Increment());
      store.dispatch(new Increment());
      store.dispatch(new Increment());
      store.dispatch(new Increment());
      store.dispatch(new Decrement());

      store.selectOnce(MyState).subscribe(res => {
        expect(res).toBe(3);
      });
    })
  );

  it(
    'should correctly dispatch an async event',
    async(() => {
      @State<number>({
        name: 'counter',
        defaults: 0
      })
      class MyState {
        @Action(Increment)
        increment({ getState, setState }: StateContext<number>) {
          return timer(10).pipe(
            tap(() => {
              setState(getState() + 1);
            })
          );
        }

        @Action(Decrement)
        decrement({ getState, setState }: StateContext<number>) {
          setState(getState() - 1);
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);

      store.dispatch(new Increment());
      store.dispatch(new Increment());

      store
        .dispatch([new Increment(), new Increment(), new Increment(), new Increment(), new Decrement()])
        .subscribe(() => {
          store.select(MyState).subscribe(res => {
            expect(res).toBe(5);
          });
        });
    })
  );

  it(
    'should correctly dispatch events from other events',
    async(() => {
      @State<number>({
        name: 'counter',
        defaults: 0
      })
      class MyState {
        @Action(Increment)
        increment({ getState, setState, dispatch }: StateContext<number>) {
          const state = getState();

          if (state < 10) {
            setState(state + 1);

            dispatch(new Increment());
          }
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);

      store.dispatch([new Increment()]).subscribe(() => {
        store.selectOnce(MyState).subscribe(res => {
          expect(res).toBe(10);
        });
      });
    })
  );

  it(
    'should correctly dispatch events from other async actions',
    async(() => {
      @State<number>({
        name: 'counter',
        defaults: 0
      })
      class MyState {
        @Action(Increment)
        increment({ getState, setState, dispatch }: StateContext<number>) {
          return timer(0).pipe(
            tap(() => {
              const state = getState();

              if (state < 10) {
                setState(state + 1);

                dispatch(new Increment());
              }
            })
          );
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);

      store
        .select(MyState)
        .pipe(skip(10))
        .subscribe(res => {
          expect(res).toBe(10);
        });

      store.dispatch([new Increment()]);
    })
  );

  it(
    'should correctly cancel previous actions',
    async(() => {
      @State<number>({
        name: 'counter',
        defaults: 0
      })
      class MyState {
        @Action(Increment, { cancelUncompleted: true })
        increment({ getState, setState, dispatch }: StateContext<number>) {
          return timer(0).pipe(
            tap(() => {
              const state = getState();

              setState(state + 1);
            })
          );
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);

      store.dispatch([
        new Increment(),
        new Increment(),
        new Increment(),
        new Increment(),
        new Increment(),
        new Increment()
      ]);

      store.dispatch([new Increment()]);

      store
        .select(MyState)
        .pipe(skip(1))
        .subscribe(res => {
          expect(res).toBe(1);
        });
    })
  );

  describe('returns an observable that', () => {
    describe('when the action handler is synchronous', () => {
      it(
        'should notify of the completion of the action handler',
        async(() => {
          let actionsHandled = 0;

          @State<number>({
            name: 'counter',
            defaults: 0
          })
          class MyState {
            @Action(Increment)
            increment({ getState, setState, dispatch }: StateContext<number>) {
              actionsHandled++;
            }
          }

          TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([MyState])]
          });

          const store: Store = TestBed.get(Store);

          store.dispatch(new Increment()).subscribe(() => {
            expect(actionsHandled).toEqual(1);
          });
        })
      );

      it(
        'should notify of the completion of multiple action handlers',
        async(() => {
          let actionsHandled = 0;

          @State<number>({
            name: 'counter',
            defaults: 0
          })
          class MyState {
            @Action(Increment)
            increment({ getState, setState, dispatch }: StateContext<number>) {
              actionsHandled++;
            }

            @Action(Increment)
            incrementAgain({ getState, setState, dispatch }: StateContext<number>) {
              actionsHandled++;
            }
          }

          TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([MyState])]
          });

          const store: Store = TestBed.get(Store);

          store.dispatch(new Increment()).subscribe(() => {
            expect(actionsHandled).toEqual(2);
          });
        })
      );
    });

    describe('when the action handler returns a promise', () => {
      it(
        'should notify of the completion of the promise',
        async(() => {
          let actionsHandled = 0;

          @State<number>({
            name: 'counter',
            defaults: 0
          })
          class MyState {
            @Action(Increment)
            increment({ getState, setState, dispatch }: StateContext<number>) {
              return new Promise<void>(resolve => setTimeout(resolve, 1)).then(() => actionsHandled++);
            }
          }

          TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([MyState])]
          });

          const store: Store = TestBed.get(Store);

          store.dispatch(new Increment()).subscribe(() => {
            expect(actionsHandled).toEqual(1);
          });
        })
      );

      it(
        'should notify of the completion of many action handlers returning promises',
        async(() => {
          let actionsHandled = 0;

          @State<number>({
            name: 'counter',
            defaults: 0
          })
          class MyState {
            @Action(Increment)
            async increment({ getState, setState, dispatch }: StateContext<number>) {
              return new Promise<void>(resolve => setTimeout(resolve, 1)).then(() => actionsHandled++);
            }

            @Action(Increment)
            incrementAgain({ getState, setState, dispatch }: StateContext<number>) {
              return new Promise<void>(resolve => setTimeout(resolve, 2)).then(() => actionsHandled++);
            }
          }

          TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([MyState])]
          });

          const store: Store = TestBed.get(Store);

          store.dispatch(new Increment()).subscribe(() => {
            expect(actionsHandled).toEqual(2);
          });
        })
      );
    });

    describe('when the action handler returns an observable', () => {
      it(
        'should notify of the completion of the observable',
        async(() => {
          let actionsHandled = 0;

          @State<number>({
            name: 'counter',
            defaults: 0
          })
          class MyState {
            @Action(Increment)
            increment({ getState, setState, dispatch }: StateContext<number>) {
              return of({}).pipe(delay(1), tap(() => actionsHandled++));
            }
          }

          TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([MyState])]
          });

          const store: Store = TestBed.get(Store);

          store.dispatch(new Increment()).subscribe(() => {
            expect(actionsHandled).toEqual(1);
          });
        })
      );

      it(
        'should notify of the completion of many action handlers returning observables',
        async(() => {
          let actionsHandled = 0;

          @State<number>({
            name: 'counter',
            defaults: 0
          })
          class MyState {
            @Action(Increment)
            increment({ getState, setState, dispatch }: StateContext<number>) {
              return of({}).pipe(delay(1), tap(() => actionsHandled++));
            }

            @Action(Increment)
            incrementAgain({ getState, setState, dispatch }: StateContext<number>) {
              return of({}).pipe(delay(2), tap(() => actionsHandled++));
            }
          }

          TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([MyState])]
          });

          const store: Store = TestBed.get(Store);

          store.dispatch(new Increment()).subscribe(() => {
            expect(actionsHandled).toEqual(2);
          });
        })
      );
    });

    describe('when the multiple action handlers for the action return a mix of synchronous, async, and observable', () => {
      it(
        'should notify of the completion of all action handlers',
        async(() => {
          let actionsHandled = 0;

          @State<number>({
            name: 'counter',
            defaults: 0
          })
          class MyState {
            @Action(Increment)
            incrementSync({ getState, setState, dispatch }: StateContext<number>) {
              actionsHandled++;
            }

            @Action(Increment)
            incrementAsync({ getState, setState, dispatch }: StateContext<number>) {
              return new Promise<void>(resolve => setTimeout(resolve, 1)).then(() => actionsHandled++);
            }

            @Action(Increment)
            incrementObservable({ getState, setState, dispatch }: StateContext<number>) {
              return of({}).pipe(delay(2), tap(() => actionsHandled++));
            }
          }

          TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([MyState])]
          });

          const store: Store = TestBed.get(Store);

          store.dispatch(new Increment()).subscribe(() => {
            expect(actionsHandled).toEqual(3);
          });
        })
      );
    });

    describe('when the action handler synchronously returns a primitive', () => {
      it(
        'should notify of the completion immediately',
        async(() => {
          @State<number>({
            name: 'counter',
            defaults: 0
          })
          class MyState {
            @Action(Increment)
            increment({ getState, setState, dispatch }: StateContext<number>) {
              return 123;
            }
          }

          TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([MyState])]
          });

          const store: Store = TestBed.get(Store);
          let subscriptionCalled = false;
          store.dispatch(new Increment()).subscribe(() => (subscriptionCalled = true));

          expect(subscriptionCalled).toBeTruthy();
        })
      );
    });
  });
});
