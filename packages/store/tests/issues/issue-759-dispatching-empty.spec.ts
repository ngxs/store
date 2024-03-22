import { Injectable } from '@angular/core';
import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';
import { TestBed } from '@angular/core/testing';
import { Subscription, throwError } from 'rxjs';
import { finalize } from 'rxjs/operators';

describe('Dispatching an empty array with errors (https://github.com/ngxs/store/issues/759)', () => {
  let subscription: Subscription;
  let events: string[] = [];
  let store: Store;

  class ActionError {
    static type = 'error';
  }

  class ActionEmptyArray {
    static type = 'two';
  }

  class ActionDispatchError {
    static type = 'three';
  }

  @State<{}>({
    name: 'app',
    defaults: {}
  })
  @Injectable()
  class AppState {
    @Action(ActionError)
    actionError() {
      return throwError(() => new Error('ActionError: should be shown in the console'));
    }

    @Action(ActionEmptyArray)
    actionTwo(ctx: StateContext<{}>) {
      return ctx.dispatch([]);
    }

    @Action(ActionDispatchError)
    actionThree(ctx: StateContext<{}>) {
      return ctx.dispatch([new ActionError()]);
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([AppState])]
    });

    store = TestBed.inject(Store);
  });

  it('dispatch([ ])', () => {
    subscription = store
      .dispatch([])
      .pipe(finalize(() => events.push('finalize')))
      .subscribe({
        next: () => events.push('next'),
        error: () => events.push('error'),
        complete: () => events.push('complete')
      });

    expect(events).toEqual(['next', 'complete', 'finalize']);
    expect(subscription.closed).toEqual(true);
  });

  it('dispatch([ new ActionEmptyArray() ])', () => {
    subscription = store
      .dispatch([new ActionEmptyArray()])
      .pipe(finalize(() => events.push('finalize')))
      .subscribe({
        next: () => events.push('next'),
        error: () => events.push('error'),
        complete: () => events.push('complete')
      });

    expect(events).toEqual(['next', 'complete', 'finalize']);
    expect(subscription.closed).toEqual(true);
  });

  it('dispatch([ new ActionEmptyArray(), ActionEmptyArray() ])', () => {
    subscription = store
      .dispatch([new ActionEmptyArray(), new ActionEmptyArray()])
      .pipe(finalize(() => events.push('finalize')))
      .subscribe({
        next: () => events.push('next'),
        error: () => events.push('error'),
        complete: () => events.push('complete')
      });

    expect(events).toEqual(['next', 'complete', 'finalize']);
    expect(subscription.closed).toEqual(true);
  });

  it('dispatch([ new ActionError() ])', () => {
    subscription = store
      .dispatch([new ActionError()])
      .pipe(finalize(() => events.push('finalize')))
      .subscribe({
        next: () => events.push('next'),
        error: () => events.push('error'),
        complete: () => events.push('complete')
      });

    expect(events).toEqual(['error', 'finalize']);
    expect(subscription.closed).toEqual(true);
  });

  it('dispatch([ new ActionDispatchError() ])', () => {
    subscription = store
      .dispatch([new ActionDispatchError()])
      .pipe(finalize(() => events.push('finalize')))
      .subscribe({
        next: () => events.push('next'),
        error: () => events.push('error'),
        complete: () => events.push('complete')
      });

    expect(events).toEqual(['error', 'finalize']);
    expect(subscription.closed).toEqual(true);
  });

  it('dispatch([ new ActionDispatchError(), new ActionDispatchError() ])', () => {
    subscription = store
      .dispatch([new ActionDispatchError(), new ActionDispatchError()])
      .pipe(finalize(() => events.push('finalize')))
      .subscribe({
        next: () => events.push('next'),
        error: () => events.push('error'),
        complete: () => events.push('complete')
      });

    expect(events).toEqual(['error', 'finalize']);
    expect(subscription.closed).toEqual(true);
  });

  it('dispatch([ new ActionError(), new ActionDispatchError() ])', () => {
    subscription = store
      .dispatch([new ActionError(), new ActionDispatchError()])
      .pipe(finalize(() => events.push('finalize')))
      .subscribe({
        next: () => events.push('next'),
        error: () => events.push('error'),
        complete: () => events.push('complete')
      });

    expect(events).toEqual(['error', 'finalize']);
    expect(subscription.closed).toEqual(true);
  });

  it('dispatch([ new ActionEmptyArray(), new ActionError() ])', () => {
    subscription = store
      .dispatch([new ActionEmptyArray(), new ActionError()])
      .pipe(finalize(() => events.push('finalize')))
      .subscribe({
        next: () => events.push('next'),
        error: () => events.push('error'),
        complete: () => events.push('complete')
      });

    expect(events).toEqual(['error', 'finalize']);
    expect(subscription.closed).toEqual(true);
  });

  it('dispatch([ new ActionEmptyArray(), new ActionDispatchError() ])', async () => {
    subscription = store
      .dispatch([new ActionEmptyArray(), new ActionDispatchError()])
      .pipe(finalize(() => events.push('finalize')))
      .subscribe({
        next: () => events.push('next'),
        error: () => events.push('error'),
        complete: () => events.push('complete')
      });

    expect(events).toEqual(['error', 'finalize']);
    expect(subscription.closed).toEqual(true);
  });

  afterEach(() => {
    events = [];
  });
});
