import { TestBed } from '@angular/core/testing';
import { ErrorHandler, Injectable } from '@angular/core';

import { Action, State, StateContext, Store, provideStore } from '@ngxs/store';
import { ɵDEFAULT_STATE_KEY } from '@ngxs/storage-plugin/internals';

import {
  NgxsStorageDeserializationError,
  NgxsStorageQuotaExceededError,
  NgxsStorageSerializationError,
  withNgxsStoragePlugin
} from '../';

describe('NgxsStoragePlugin ErrorHandler reporting', () => {
  beforeEach(() => TestBed.resetTestingModule());

  class Increment {
    static type = 'INCREMENT';
  }

  interface CounterStateModel {
    count: number;
  }

  @State<CounterStateModel>({
    name: 'counter',
    defaults: { count: 0 }
  })
  @Injectable()
  class CounterState {
    @Action(Increment)
    increment(ctx: StateContext<CounterStateModel>) {
      ctx.patchState({ count: ctx.getState().count + 1 });
    }
  }

  afterEach(() => {
    localStorage.removeItem(ɵDEFAULT_STATE_KEY);
  });

  it('should report deserialization failures to ErrorHandler', () => {
    // Arrange
    localStorage.setItem(ɵDEFAULT_STATE_KEY, '{not valid json');
    const handleError = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    TestBed.configureTestingModule({
      providers: [
        provideStore([CounterState], withNgxsStoragePlugin({ keys: '*' })),
        { provide: ErrorHandler, useValue: { handleError } }
      ]
    });

    try {
      // Act
      TestBed.inject(Store);

      // Assert
      expect(handleError).toHaveBeenCalledTimes(1);
      const reportedError = handleError.mock.calls[0][0];
      expect(reportedError).toBeInstanceOf(NgxsStorageDeserializationError);
      expect(reportedError.key).toBe(ɵDEFAULT_STATE_KEY);
      expect(reportedError.cause).toBeInstanceOf(Error);
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it('should report serialization failures to ErrorHandler', () => {
    // Arrange
    const handleError = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const boom = new Error('boom');

    TestBed.configureTestingModule({
      providers: [
        provideStore(
          [CounterState],
          withNgxsStoragePlugin({
            keys: '*',
            serialize: () => {
              throw boom;
            }
          })
        ),
        { provide: ErrorHandler, useValue: { handleError } }
      ]
    });

    try {
      // Act
      const store: Store = TestBed.inject(Store);
      store.dispatch(new Increment());

      // Assert
      expect(handleError).toHaveBeenCalledTimes(1);
      const reportedError = handleError.mock.calls[0][0];
      expect(reportedError).toBeInstanceOf(NgxsStorageSerializationError);
      expect(reportedError.key).toBe(ɵDEFAULT_STATE_KEY);
      expect(reportedError.cause).toBe(boom);
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it('should report quota-exceeded write failures as NgxsStorageQuotaExceededError', () => {
    // Arrange
    const handleError = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const quotaError = new Error('quota');
    quotaError.name = 'QuotaExceededError';

    TestBed.configureTestingModule({
      providers: [
        provideStore(
          [CounterState],
          withNgxsStoragePlugin({
            keys: '*',
            serialize: () => {
              throw quotaError;
            }
          })
        ),
        { provide: ErrorHandler, useValue: { handleError } }
      ]
    });

    try {
      // Act
      const store: Store = TestBed.inject(Store);
      store.dispatch(new Increment());

      // Assert
      expect(handleError).toHaveBeenCalledTimes(1);
      const reportedError = handleError.mock.calls[0][0];
      expect(reportedError).toBeInstanceOf(NgxsStorageQuotaExceededError);
      expect(reportedError.cause).toBe(quotaError);
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it('should report a quota-exceeded key only once until a write for it succeeds again', () => {
    // Arrange
    const handleError = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const quotaError = new Error('quota');
    quotaError.name = 'QuotaExceededError';
    let shouldThrow = true;

    TestBed.configureTestingModule({
      providers: [
        provideStore(
          [CounterState],
          withNgxsStoragePlugin({
            keys: '*',
            serialize: value => {
              if (shouldThrow) throw quotaError;
              return JSON.stringify(value);
            }
          })
        ),
        { provide: ErrorHandler, useValue: { handleError } }
      ]
    });

    try {
      // Act — dispatch three times while still over quota.
      const store: Store = TestBed.inject(Store);
      store.dispatch(new Increment());
      store.dispatch(new Increment());
      store.dispatch(new Increment());

      // Assert — only the first write for this key was reported.
      expect(handleError).toHaveBeenCalledTimes(1);

      // Act — the write succeeds now (quota pressure resolved elsewhere).
      shouldThrow = false;
      store.dispatch(new Increment());

      // Act — quota is hit again.
      shouldThrow = true;
      store.dispatch(new Increment());

      // Assert — reported again, since the key had recovered in between.
      expect(handleError).toHaveBeenCalledTimes(2);
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it('should not report anything to ErrorHandler when reads/writes succeed', () => {
    // Arrange
    const handleError = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideStore([CounterState], withNgxsStoragePlugin({ keys: '*' })),
        { provide: ErrorHandler, useValue: { handleError } }
      ]
    });

    // Act
    const store: Store = TestBed.inject(Store);
    store.dispatch(new Increment());

    // Assert
    expect(handleError).not.toHaveBeenCalled();
  });
});
