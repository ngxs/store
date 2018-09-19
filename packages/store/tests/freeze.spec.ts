import { TestBed } from '@angular/core/testing';
import { ErrorHandler } from '@angular/core';
import { NgxsModule } from '../src/module';
import { Store } from '../src/store';
import { NoopErrorHandler } from './helpers/utils';
import {
  Application,
  ApplicationDeepFrozen,
  ApplicationShallowFrozen,
  ApplicationState,
  PeriodDeepFrozen
} from './helpers/application.state';
import { setUpTestBed } from './helpers/test-bed';

describe('Freeze to prevent mutation ', () => {
  const periodMock = { id: 1, startDate: new Date(), endDate: new Date() };
  const applicationMock = { id: 1, periods: [periodMock] };

  setUpTestBed({
    imports: [NgxsModule.forRoot([ApplicationState])],
    providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
  });

  it('should give an error if the change reference by the ApplicationShallowFrozen action', () => {
    const store = <Store>TestBed.get(Store);
    const observedCallbacks = [];

    store.dispatch(new ApplicationShallowFrozen(applicationMock)).subscribe({
      next: () => observedCallbacks.push('next'),
      error: error => observedCallbacks.push('error: ' + error),
      complete: () => observedCallbacks.push('complete')
    });

    expect(observedCallbacks).toEqual([
      `error: TypeError: Cannot assign to read only property 'payload' of object '[object Object]'`
    ]);
  });

  it('should not give an error if the deep mutation by the ApplicationShallowFrozen action', () => {
    const store = <Store>TestBed.get(Store);
    store.dispatch(new ApplicationShallowFrozen(applicationMock));

    // because we can do mutation into state (by default)
    // applicationMock === { id: 100, periods: [] }
    // external objects in their transfer can be broken
    expect(applicationMock).toEqual({ id: 100, periods: [] });
  });

  it('should give an error if the change deep', () => {
    const store = <Store>TestBed.get(Store);
    const observedCallbacks = [];

    store.dispatch(new PeriodDeepFrozen(periodMock)).subscribe({
      next: () => observedCallbacks.push('next'),
      error: error => observedCallbacks.push('error: ' + error),
      complete: () => observedCallbacks.push('complete')
    });

    expect(observedCallbacks).toEqual([
      `error: TypeError: Cannot assign to read only property 'startDate' of object '[object Object]'`
    ]);
  });

  it('should be state must be completely unfrozen', () => {
    const store = <Store>TestBed.get(Store);
    const observedCallbacks = [];
    const data = { id: 2, periods: [{ id: 2, startDate: null, endDate: null }] };

    store.dispatch(new ApplicationDeepFrozen(data)).subscribe({
      next: () => observedCallbacks.push('next'),
      error: error => observedCallbacks.push('error: ' + error),
      complete: () => observedCallbacks.push('complete')
    });

    const application: Application = store.selectSnapshot(ApplicationState);
    expect(Object.isFrozen(application)).toEqual(false);
    expect(Object.isFrozen(application.periods)).toEqual(false);
  });
});
