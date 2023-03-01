import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { State, Action, Store, NgxsModule, StateContext } from '@ngxs/store';
import { of, throwError, timer } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

import { NoopErrorHandler } from './helpers/utils';

describe('Dispatch', () => {
  class Increment {
    static type = 'INCREMENT';
  }

  class Decrement {
    static type = 'DECREMENT';
  }

  it('should run outside zone and return back in zone', () => {
    // Arrange
    @State<number>({
      name: 'counter',
      defaults: 0
    })
    @Injectable()
    class MyState {
      @Action(Increment)
      increment() {
        expect(NgZone.isInAngularZone()).toBe(false);
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState]), NgxsModule.forFeature([])]
    });

    const store = TestBed.inject(Store);
    const zone = TestBed.inject(NgZone);

    // Act
    zone.run(() => {
      expect(NgZone.isInAngularZone()).toBe(true);
      store.dispatch(new Increment()).subscribe(() => {
        expect(NgZone.isInAngularZone()).toBe(true);
      });
    });
  });

  it('should only call action once', () => {
    // Arrange
    let actionInvoked = 0;
    let subscibeInvoked = 0;
    let selectInvoked = 0;

    @State<number>({
      name: 'counter',
      defaults: 0
    })
    @Injectable()
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

    const store = TestBed.inject(Store);

    // Act
    store.dispatch(new Increment()).subscribe(() => subscibeInvoked++);
    store.select(MyState).subscribe(res => {
      expect(res).toBe(1);
      selectInvoked++;
    });

    // Assert
    expect(actionInvoked).toEqual(1);
    expect(subscibeInvoked).toEqual(1);
    expect(selectInvoked).toEqual(1);
  });

  it('should correctly dispatch the action', async () => {
    // Arrange
    @State<number>({
      name: 'counter',
      defaults: 0
    })
    @Injectable()
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

    const store = TestBed.inject(Store);

    // Act
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Decrement());

    // Assert
    expect(await store.selectOnce(MyState).toPromise()).toEqual(3);
  });

  it('should correctly dispatch an async event', async () => {
    // Arrange
    @State<number>({
      name: 'counter',
      defaults: 0
    })
    @Injectable()
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

    const store = TestBed.inject(Store);

    // Act
    store.dispatch(new Increment());
    store.dispatch(new Increment());

    await store
      .dispatch([
        new Increment(),
        new Increment(),
        new Increment(),
        new Increment(),
        new Decrement()
      ])
      .toPromise();

    // Assert
    expect(await store.selectOnce(MyState).toPromise()).toEqual(5);
  });

  it('should correctly dispatch events from other events', async () => {
    // Arrange
    @State<number>({
      name: 'counter',
      defaults: 0
    })
    @Injectable()
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

    const store = TestBed.inject(Store);

    // Act
    store.dispatch([new Increment()]);

    // Assert
    expect(await store.selectOnce(MyState).toPromise()).toEqual(10);
  });

  it('should correctly dispatch events from other async actions', fakeAsync(async () => {
    // Arrange
    const iterations = 10;

    @State<number>({
      name: 'counter',
      defaults: 0
    })
    @Injectable()
    class MyState {
      @Action(Increment)
      increment({ getState, setState, dispatch }: StateContext<number>) {
        return timer(0).pipe(
          map(() => {
            const state = getState();

            if (state < iterations) {
              setState(state + 1);

              return dispatch(new Increment());
            }
            return;
          })
        );
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])]
    });

    const store = TestBed.inject(Store);

    // Act
    store.dispatch([new Increment()]);

    // Flush all of the timers equal to number of iterations.
    Array.from({ length: iterations }).forEach(() => tick(0));

    // Assert
    expect(await store.selectOnce(MyState).toPromise()).toEqual(10);
  }));

  it('should correctly cancel previous actions', fakeAsync(async () => {
    // Arrange
    let actionInvokedTimes = 0;

    @State<number>({
      name: 'counter',
      defaults: 0
    })
    @Injectable()
    class MyState {
      @Action(Increment, { cancelUncompleted: true })
      increment({ getState, setState }: StateContext<number>) {
        actionInvokedTimes++;
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

    const store = TestBed.inject(Store);

    // Act
    store.dispatch([
      new Increment(),
      new Increment(),
      new Increment(),
      new Increment(),
      new Increment(),
      new Increment()
    ]);

    store.dispatch([new Increment()]);

    tick(0);

    // Assert
    expect(actionInvokedTimes).toEqual(7);
    expect(await store.selectOnce(MyState).toPromise()).toEqual(1);
  }));

  describe('returns an observable that', () => {
    describe('when the action handler is synchronous', () => {
      it('should notify of the completion of the action handler', () => {
        // Arrange
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
        class MyState {
          @Action(Increment)
          increment() {
            actionsHandled++;
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store = TestBed.inject(Store);

        // Act
        store.dispatch(new Increment());

        // Assert
        expect(actionsHandled).toEqual(1);
      });

      it('should notify of the completion of multiple action handlers', () => {
        // Arrange
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
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

        const store = TestBed.inject(Store);

        // Act
        store.dispatch(new Increment());

        // Assert
        expect(actionsHandled).toEqual(2);
      });
    });

    describe('when the action handler returns a promise', () => {
      it('should notify of the completion of the promise', fakeAsync(() => {
        // Arrange
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
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

        const store = TestBed.inject(Store);

        // Act
        store.dispatch(new Increment());
        flush();

        // Assert
        expect(actionsHandled).toEqual(1);
      }));

      it('should notify of the completion of many action handlers returning promises', fakeAsync(() => {
        // Arrange
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
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

        const store = TestBed.inject(Store);

        // Act
        store.dispatch(new Increment());
        // 10 should be enough to flush both.
        tick(10);

        // Assert
        expect(actionsHandled).toEqual(2);
      }));
    });

    describe('when the action handler returns an observable', () => {
      it('should notify of the completion of the observable', fakeAsync(() => {
        // Arrange
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
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

        const store = TestBed.inject(Store);

        // Act
        store.dispatch(new Increment());
        tick(10);

        // Assert
        expect(actionsHandled).toEqual(1);
      }));

      it('should notify of the completion of many action handlers returning observables', fakeAsync(() => {
        // Arrange
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
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

        const store = TestBed.inject(Store);

        // Act
        store.dispatch(new Increment());
        tick(10);

        // Assert
        expect(actionsHandled).toEqual(2);
      }));
    });

    describe('when the multiple action handlers for the action return a mix of synchronous, async, and observable', () => {
      it('should notify of the completion of all action handlers', fakeAsync(() => {
        // Arrange
        let actionsHandled = 0;

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
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

        const store = TestBed.inject(Store);

        // Act
        store.dispatch(new Increment());
        tick(10);

        // Assert
        expect(actionsHandled).toEqual(3);
      }));
    });

    describe('when the action handler synchronously returns a primitive', () => {
      it('should notify of the completion immediately', () => {
        // Arrange
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
        class MyState {
          @Action(Increment)
          increment() {
            return 123;
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store = TestBed.inject(Store);

        let subscriptionCalled = false;
        // Act
        store.dispatch(new Increment()).subscribe(() => {
          subscriptionCalled = true;
        });

        // Assert
        expect(subscriptionCalled).toBeTruthy();
      });
    });

    describe('when there are no action handlers', () => {
      it('should notify of the completion immediately', () => {
        // Arrange
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
        class MyState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store = TestBed.inject(Store);
        let subscriptionCalled = false;
        // Act
        store.dispatch(new Increment()).subscribe(() => (subscriptionCalled = true));

        // Assert
        expect(subscriptionCalled).toBeTruthy();
      });
    });

    describe('when an empty action array is provided', () => {
      it('should notify of the completion immediately', () => {
        // Arrange
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
        class MyState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store = TestBed.inject(Store);
        let completionCalled = false;
        // Act
        store.dispatch([]).subscribe({
          complete: () => (completionCalled = true)
        });

        // Assert
        expect(completionCalled).toBeTruthy();
      });

      it('should have a next value', () => {
        // Arrange
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
        class MyState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store = TestBed.inject(Store);
        let nextCalled = false;
        // Act
        store.dispatch([]).subscribe({
          next: () => (nextCalled = true)
        });

        // Assert
        expect(nextCalled).toBeTruthy();
      });

      it('should not have an error value', () => {
        // Arrange
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
        class MyState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState])]
        });

        const store = TestBed.inject(Store);
        let errorCalled = false;
        // Act
        store.dispatch([]).subscribe({
          error: () => (errorCalled = true)
        });

        // Assert
        expect(errorCalled).toBeFalsy();
      });
    });

    describe('when the action is canceled by a subsequent action', () => {
      it('should not trigger observer, but should complete observable stream', fakeAsync(() => {
        // Arrange
        const resolvers: (() => void)[] = [];
        const subscriptionsCalled: string[] = [];

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
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

        const store = TestBed.inject(Store);

        // Act
        store.dispatch(new Increment()).subscribe(
          () => subscriptionsCalled.push('previous'),
          () => subscriptionsCalled.push('previous error'),
          () => subscriptionsCalled.push('previous complete')
        );
        store.dispatch(new Increment());
        resolvers[0]();
        resolvers[1]();
        tick(0);

        // Assert
        expect(subscriptionsCalled).toEqual(['increment', 'previous complete', 'increment']);
      }));

      it('should trigger next and completion for latest but only completion for previous', fakeAsync(() => {
        // Arrange
        const resolvers: (() => void)[] = [];
        const subscriptionsCalled: string[] = [];

        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
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

        const store = TestBed.inject(Store);

        // Act
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

        // Assert
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
      it('should not trigger observer, but should error the observable stream', () => {
        // Arrange
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
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

        const store = TestBed.inject(Store);

        const subscriptionsCalled: string[] = [];
        // Act
        store.dispatch(new Increment()).subscribe(
          () => subscriptionsCalled.push('next'),
          error => subscriptionsCalled.push('error: ' + error),
          () => subscriptionsCalled.push('complete')
        );

        // Assert
        expect(subscriptionsCalled).toEqual(['error: This is my error message!']);
      });
    });

    describe('when the action throws an error', () => {
      it('should not trigger observer, but should error the observable stream', () => {
        // Arrange
        @State<number>({
          name: 'counter',
          defaults: 0
        })
        @Injectable()
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

        const store = TestBed.inject(Store);
        const subscriptionsCalled: string[] = [];

        // Act
        store.dispatch(new Increment()).subscribe(
          () => subscriptionsCalled.push('next'),
          (error: Error) => subscriptionsCalled.push('error: ' + error.message),
          () => subscriptionsCalled.push('complete')
        );

        // Assert
        expect(subscriptionsCalled).toEqual(['error: This is my error message!']);
      });
    });

    describe('when many separate actions dispatched return out of order', () => {
      it('should notify of the completion of the relative observable', fakeAsync(() => {
        // Arrange
        class Append {
          static type = 'Test';

          constructor(public payload: string) {}
        }

        @State<string>({
          name: 'text',
          defaults: ''
        })
        @Injectable()
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

        const store = TestBed.inject(Store);

        // Act & assert
        store
          .dispatch(new Append('dddd'))
          .subscribe(state => expect(state.text).toEqual('abbcccdddd'));
        store.dispatch(new Append('a')).subscribe(state => expect(state.text).toEqual('a'));
        store
          .dispatch(new Append('ccc'))
          .subscribe(state => expect(state.text).toEqual('abbccc'));
        store.dispatch(new Append('bb')).subscribe(state => expect(state.text).toEqual('abb'));

        tick(100);
      }));
    });

    describe('when many actions dispatched together', () => {
      it('should notify once all completed', fakeAsync(() => {
        // Arrange
        class Append {
          static type = 'Test';

          constructor(public payload: string) {}
        }

        @State<string>({
          name: 'text',
          defaults: ''
        })
        @Injectable()
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

        const store = TestBed.inject(Store);

        // Act & assert
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

        tick(100);
      }));
    });
  });
});
