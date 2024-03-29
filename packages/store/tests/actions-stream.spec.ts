import { TestBed } from '@angular/core/testing';
import { ActionStatus } from '@ngxs/store';
import { ɵOrderedSubject } from '@ngxs/store/internals';
import { Subject } from 'rxjs';

import { InternalActions } from '../src/actions-stream';

describe('The Actions stream', () => {
  it('should not use Subject because of the following issue (note that 3rd subscriber receives the events out of order)', () => {
    // Arrange
    const statuses$ = new Subject<string>();
    const callsRecorded = <string[]>[];

    // Act
    statuses$.subscribe(status => callsRecorded.push('1st Subscriber:' + status));
    statuses$.subscribe(status => {
      callsRecorded.push('2nd Subscriber:' + status);
      if (status === 'dispatch') statuses$.next('complete');
    });
    statuses$.subscribe(status => callsRecorded.push('3rd Subscriber:' + status));

    statuses$.next('dispatch');

    // Assert
    expect(callsRecorded).toEqual([
      '1st Subscriber:dispatch',
      '2nd Subscriber:dispatch',
      '1st Subscriber:complete',
      '2nd Subscriber:complete',
      '3rd Subscriber:complete',
      '3rd Subscriber:dispatch'
    ]);
  });

  it('should rather use OrderedSubject because it preserves the order of dispatch for subscribers', () => {
    // Arrange
    const statuses$ = new ɵOrderedSubject<string>();
    const callsRecorded = <string[]>[];

    // Act
    statuses$.subscribe(status => callsRecorded.push('1st Subscriber:' + status));
    statuses$.subscribe(status => {
      callsRecorded.push('2nd Subscriber:' + status);
      if (status === 'dispatch') statuses$.next('complete');
    });
    statuses$.subscribe(status => callsRecorded.push('3rd Subscriber:' + status));

    statuses$.next('dispatch');

    // Assert
    expect(callsRecorded).toEqual([
      '1st Subscriber:dispatch',
      '2nd Subscriber:dispatch',
      '3rd Subscriber:dispatch',
      '1st Subscriber:complete',
      '2nd Subscriber:complete',
      '3rd Subscriber:complete'
    ]);
  });

  it('should preserve the order of dispatch for subscribers', () => {
    // Arrange & act
    TestBed.configureTestingModule({
      providers: [InternalActions]
    });

    const internalActions: InternalActions = TestBed.inject(InternalActions);
    const callsRecorded = <string[]>[];

    internalActions.subscribe(({ status }) => callsRecorded.push('1st Subscriber:' + status));
    internalActions.subscribe(({ status }) => {
      callsRecorded.push('2nd Subscriber:' + status);
      if (status === ActionStatus.Dispatched)
        internalActions.next({ status: ActionStatus.Successful, action: null });
    });
    internalActions.subscribe(({ status }) => callsRecorded.push('3rd Subscriber:' + status));

    internalActions.next({ status: ActionStatus.Dispatched, action: null });

    // Assert
    expect(callsRecorded).toEqual([
      '1st Subscriber:DISPATCHED',
      '2nd Subscriber:DISPATCHED',
      '3rd Subscriber:DISPATCHED',
      '1st Subscriber:SUCCESSFUL',
      '2nd Subscriber:SUCCESSFUL',
      '3rd Subscriber:SUCCESSFUL'
    ]);
  });
});
