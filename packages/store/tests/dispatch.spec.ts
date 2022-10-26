import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, throwError, timer } from 'rxjs';
import { delay, skip, tap } from 'rxjs/operators';

import { NoopErrorHandler } from './helpers/utils';
import { State, Action, Store, NgxsModule, StateContext, NgxsExecutionStrategy } from '..';

describe('Dispatch', () => {
  class Increment {
    static type = 'INCREMENT';
  }

  class Decrement {
    static type = 'DECREMENT';
  }

  it('should throw error', async(() => {
    const observedCalls: string[] = [];

    @State<number>({
      name: 'counter',
      defaults: 0
    })
    @Injectable()
    class MyState {
      @Action(Increment)
      increment() {
        throw new Error();
      }
    }

    @Injectable()
    class CustomErrorHandler implements ErrorHandler {
      handleError() {
        observedCalls.push('handleError(...)');
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])],
      providers: [
        {
          provide: ErrorHandler,
          useClass: CustomErrorHandler
        }
      ]
    });

    const store: Store = TestBed.inject(Store);

    store.dispatch(new Increment()).subscribe(
      () => {},
      () => observedCalls.push('observer.error(...)')
    );

    expect(observedCalls).toEqual(['handleError(...)', 'observer.error(...)']);
  }));

  it('should not propagate an unhandled exception', () => {
    // Arrange
    const message = 'This is an eval error...';

    @State<number>({
      name: 'counter',
      defaults: 0
    })
    @Injectable()
    class CounterState {
      @Action(Increment)
      increment() {
        throw new EvalError(message);
      }
    }

    @Injectable({ providedIn: 'root' })
    class FakeExecutionStrategy implements NgxsExecutionStrategy {
      enter<T>(func: () => T): T {
        return func();
      }

      leave<T>(func: () => T): T {
        return func();
      }
    }

    @Injectable()
    class CustomErrorHandler implements ErrorHandler {
      handleError(error: Error): void {
        throw error;
      }
    }

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState], {
          executionStrategy: FakeExecutionStrategy
        })
      ],
      providers: [
        {
          provide: ErrorHandler,
          useClass: CustomErrorHandler
        }
      ]
    });

    const store: Store = TestBed.inject(Store);

    // `typeof message | null` as we don't know will be assigned or not.
    // Let's test it out at the end
    let thrownMessage: typeof message | null = null;

    // Start spying after module is initialized, not before
    jest.spyOn(FakeExecutionStrategy.prototype, 'leave').mockImplementationOnce(func => {
      try {
        return func();
      } catch (e) {
        thrownMessage = e.message;
      }
    });

    store.dispatch(new Increment());

    // Assert
    expect(thrownMessage).toBeNull();
  });

  it('should run outside zone and return back in zone', async(() => {
    @State<number>({
      name: 'counter',
      defaults: 0
    })
    class MyState {
      @Action(Increment)
      increment() {
        expect(NgZone.isInAngularZone()).toBe(false);
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState]), NgxsModule.forFeature([])]
    });

    const store: Store = TestBed.inject(Store);
    const zone: NgZone = TestBed.inject(NgZone);
    zone.run(() => {
      expect(NgZone.isInAngularZone()).toBe(true);
      store.dispatch(new Increment()).subscribe(() => {
        expect(NgZone.isInAngularZone()).toBe(true);
      });
    });
  }));

  it('should only call action once', async(() => {
    let actionInvoked = 0;
    let subscibeInvoked = 0;
    let selectInvoked = 0;

    @State<number>({
      name: 'counter',
      defaults: 0
    })
    class MyState {
      @Action(Increment)
      increment({ getState, setState }: StateContext<number>) {
        setState(getState() + 1);
        actionInvoked++;
        return of({});
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState]), NgxsModule.forFeature([])]
    });

    const store: Store = TestBed.inject(Store);
    store.dispatch(new Increment()).subscribe(() => subscibeInvoked++);

    store.select(MyState).subscribe(res => {
      expect(res).toBe(1);
      selectInvoked++;
    });

    expect(actionInvoked).toEqual(1);
    expect(subscibeInvoked).toEqual(1);
    expect(selectInvoked).toEqual(1);
  }));

  it('should correctly dispatch the action', async(() => {
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

    const store: Store = TestBed.inject(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Decrement());

    store.selectOnce(MyState).subscribe(res => {
      expect(res).toBe(3);
    });
  }));

  it('should correctly dispatch an async event', async(() => {
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

    const store: Store = TestBed.inject(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());

    store
      .dispatch([
        new Increment(),
        new Increment(),
        new Increment(),
        new Increment(),
        new Decrement()
      ])
      .subscribe(() => {
        store.select(MyState).subscribe(res => {
          expect(res).toBe(5);
        });
      });
  }));

  it('should correctly dispatch events from other events', async(() => {
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

    const store: Store = TestBed.inject(Store);

    store.dispatch([new Increment()]).subscribe(() => {
      store.selectOnce(MyState).subscribe(res => {
        expect(res).toBe(10);
      });
    });
  }));

  it('should correctly dispatch events from other async actions', async(() => {
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

    const store: Store = TestBed.inject(Store);

    store
      .select(MyState)
      .pipe(skip(10))
      .subscribe(res => {
        expect(res).toBe(10);
      });

    store.dispatch([new Increment()]);
  }));

  it('should correctly cancel previous actions', async(() => {
    @State<number>({
      name: 'counter',
      defaults: 0
    })
    class MyState {
      @Action(Increment, { cancelUncompleted: true })
      increment({ getState, setState }: StateContext<number>) {
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

    const store: Store = TestBed.inject(Store);

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
  }));

  describe('returns an observable that', () => {
    describe('when the action handler is synchronous', () => {
      it('should notify of the completion of the action handler', async(() => {
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {
          @Action(Increment)
          increment() {
            actionsHandled++;
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);

        store.dispatch(new Increment()).subscribe(() => {
          expect(actionsHandled).toEqual(1);
        });
      }));

      it('should notify of the completion of multiple action handlers', async(() => {
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {
          @Action(Increment)
          increment() {
            actionsHandled++;
          }

          @Action(Increment)
          incrementAgain() {
            actionsHandled++;
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);

        store.dispatch(new Increment()).subscribe(() => {
          expect(actionsHandled).toEqual(2);
        });
      }));
    });

    describe('when the action handler returns a promise', () => {
      it('should notify of the completion of the promise', async(() => {
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {
          @Action(Increment)
          increment() {
            return new Promise<void>(resolve => setTimeout(resolve, 1)).then(
              () => actionsHandled++
            );
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);

        store.dispatch(new Increment()).subscribe(() => {
          expect(actionsHandled).toEqual(1);
        });
      }));

      it('should notify of the completion of many action handlers returning promises', async(() => {
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {
          @Action(Increment)
          async increment() {
            return new Promise<void>(resolve => setTimeout(resolve, 1)).then(
              () => actionsHandled++
            );
          }

          @Action(Increment)
          incrementAgain() {
            return new Promise<void>(resolve => setTimeout(resolve, 2)).then(
              () => actionsHandled++
            );
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);

        store.dispatch(new Increment()).subscribe(() => {
          expect(actionsHandled).toEqual(2);
        });
      }));
    });

    describe('when the action handler returns an observable', () => {
      it('should notify of the completion of the observable', async(() => {
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {
          @Action(Increment)
          increment() {
            return of({}).pipe(
              delay(1),
              tap(() => actionsHandled++)
            );
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);

        store.dispatch(new Increment()).subscribe(() => {
          expect(actionsHandled).toEqual(1);
        });
      }));

      it('should notify of the completion of many action handlers returning observables', async(() => {
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {
          @Action(Increment)
          increment() {
            return of({}).pipe(
              delay(1),
              tap(() => actionsHandled++)
            );
          }

          @Action(Increment)
          incrementAgain() {
            return of({}).pipe(
              delay(2),
              tap(() => actionsHandled++)
            );
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);

        store.dispatch(new Increment()).subscribe(() => {
          expect(actionsHandled).toEqual(2);
        });
      }));
    });

    describe('when the multiple action handlers for the action return a mix of synchronous, async, and observable', () => {
      it('should notify of the completion of all action handlers', async(() => {
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {
          @Action(Increment)
          incrementSync() {
            actionsHandled++;
          }

          @Action(Increment)
          incrementAsync() {
            return new Promise<void>(resolve => setTimeout(resolve, 1)).then(
              () => actionsHandled++
            );
          }

          @Action(Increment)
          incrementObservable() {
            return of({}).pipe(
              delay(2),
              tap(() => actionsHandled++)
            );
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);

        store.dispatch(new Increment()).subscribe(() => {
          expect(actionsHandled).toEqual(3);
        });
      }));
    });

    describe('when the action handler synchronously returns a primitive', () => {
      it('should notify of the completion immediately', async(() => {
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {
          @Action(Increment)
          increment() {
            return 123;
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);

        let subscriptionCalled = false;
        store.dispatch(new Increment()).subscribe(() => {
          subscriptionCalled = true;
        });

        expect(subscriptionCalled).toBeTruthy();
      }));
    });

    describe('when there are no action handlers', () => {
      it('should notify of the completion immediately', async(() => {
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);
        let subscriptionCalled = false;
        store.dispatch(new Increment()).subscribe(() => (subscriptionCalled = true));

        expect(subscriptionCalled).toBeTruthy();
      }));
    });

    describe('when an empty action array is provided', () => {
      it('should notify of the completion immediately', async(() => {
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);
        let completionCalled = false;
        store.dispatch([]).subscribe({
          complete: () => (completionCalled = true)
        });

        expect(completionCalled).toBeTruthy();
      }));

      it('should have a next value', async(() => {
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);
        let nextCalled = false;
        store.dispatch([]).subscribe({
          next: () => (nextCalled = true)
        });

        expect(nextCalled).toBeTruthy();
      }));

      it('should not have an error value', async(() => {
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);
        let errorCalled = false;
        store.dispatch([]).subscribe({
          error: () => (errorCalled = true)
        });

        expect(errorCalled).toBeFalsy();
      }));
    });

    describe('when the action is canceled by a subsequent action', () => {
      it('should not trigger observer, but should complete observable stream', fakeAsync(() => {
        const resolvers: (() => void)[] = [];
        const subscriptionsCalled: string[] = [];

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {
          @Action(Increment, { cancelUncompleted: true })
          increment() {
            subscriptionsCalled.push('increment');
            return new Promise<void>(resolve => resolvers.push(resolve));
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);

        store.dispatch(new Increment()).subscribe(
          () => subscriptionsCalled.push('previous'),
          () => subscriptionsCalled.push('previous error'),
          () => subscriptionsCalled.push('previous complete')
        );
        store.dispatch(new Increment());
        resolvers[0]();
        resolvers[1]();
        tick(0);
        expect(subscriptionsCalled).toEqual(['increment', 'previous complete', 'increment']);
      }));

      it('should trigger next and completion for latest but only completion for previous', fakeAsync(() => {
        const resolvers: (() => void)[] = [];
        const subscriptionsCalled: string[] = [];

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {
          @Action(Increment, { cancelUncompleted: true })
          increment() {
            subscriptionsCalled.push('increment');
            return new Promise<void>(resolve => resolvers.push(resolve));
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);

        store.dispatch(new Increment()).subscribe(
          () => subscriptionsCalled.push('previous'),
          () => subscriptionsCalled.push('previous error'),
          () => subscriptionsCalled.push('previous complete')
        );
        store.dispatch(new Increment()).subscribe(
          () => subscriptionsCalled.push('latest'),
          () => subscriptionsCalled.push('latest error'),
          () => subscriptionsCalled.push('latest complete')
        );
        resolvers[0]();
        resolvers[1]();
        tick(0);
        expect(subscriptionsCalled).toEqual([
          'increment',
          'previous complete',
          'increment',
          'latest',
          'latest complete'
        ]);
      }));
    });

    describe('when the action returns an observable error', () => {
      it('should not trigger observer, but should error the observable stream', async(() => {
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {
          @Action(Increment)
          increment() {
            return throwError('This is my error message!');
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])],
          providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
        });

        const store: Store = TestBed.inject(Store);

        const subscriptionsCalled: string[] = [];
        store.dispatch(new Increment()).subscribe(
          () => subscriptionsCalled.push('next'),
          error => subscriptionsCalled.push('error: ' + error),
          () => subscriptionsCalled.push('complete')
        );
        expect(subscriptionsCalled).toEqual(['error: This is my error message!']);
      }));
    });

    describe('when the action throws an error', () => {
      it('should not trigger observer, but should error the observable stream', async(() => {
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        class MyState {
          @Action(Increment)
          increment() {
            throw new Error('This is my error message!');
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])],
          providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
        });

        const store: Store = TestBed.inject(Store);

        const subscriptionsCalled: string[] = [];
        store.dispatch(new Increment()).subscribe(
          () => subscriptionsCalled.push('next'),
          (error: Error) => subscriptionsCalled.push('error: ' + error.message),
          () => subscriptionsCalled.push('complete')
        );
        expect(subscriptionsCalled).toEqual(['error: This is my error message!']);
      }));
    });

    describe('when many separate actions dispatched return out of order', () => {
      it('should notify of the completion of the relative observable', async(() => {
        class Append {
          static type = 'Test';

          constructor(public payload: string) {}
        }

        @State<string>({
          name: 'text',
          defaults: ''
        })
        class MyState {
          @Action(Append)
          append({ getState, setState }: StateContext<string>, { payload }: Append) {
            return of({}).pipe(
              delay(payload.length * 10),
              tap(() => setState(getState() + payload))
            );
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);

        store
          .dispatch(new Append('dddd'))
          .subscribe(state => expect(state.text).toEqual('abbcccdddd'));
        store.dispatch(new Append('a')).subscribe(state => expect(state.text).toEqual('a'));
        store
          .dispatch(new Append('ccc'))
          .subscribe(state => expect(state.text).toEqual('abbccc'));
        store.dispatch(new Append('bb')).subscribe(state => expect(state.text).toEqual('abb'));
      }));
    });

    describe('when many actions dispatched together', () => {
      it('should notify once all completed', async(() => {
        class Append {
          static type = 'Test';

          constructor(public payload: string) {}
        }

        @State<string>({
          name: 'text',
          defaults: ''
        })
        class MyState {
          @Action(Append)
          append({ getState, setState }: StateContext<string>, { payload }: Append) {
            return of({}).pipe(
              delay(payload.length * 10),
              tap(() => setState(getState() + payload))
            );
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store: Store = TestBed.inject(Store);

        store
          .dispatch([new Append('dddd'), new Append('a'), new Append('ccc'), new Append('bb')])
          .subscribe(results => {
            expect(results.map((r: any) => r.text)).toEqual([
              'abbcccdddd',
              'a',
              'abbccc',
              'abb'
            ]);
          });
      }));
    });
  });
});
