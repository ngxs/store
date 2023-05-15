import { Subject, BehaviorSubject } from 'rxjs';

/**
 * This wraps the provided function, and will enforce the following:
 * - The calls will execute in the order that they are made
 * - A call will only be initiated when the previous call has completed
 * - If there is a call currently executing then the new call will be added
 *   to the queue and the function will return immediately
 *
 * NOTE: The following assumptions about the operation must hold true:
 * - The operation is synchronous in nature
 * - If any asynchronous side effects of the call exist, it should not
 *   have any bearing on the correctness of the next call in the queue
 * - The operation has a void return
 * - The caller should not assume that the call has completed upon
 *   return of the function
 * - The caller can assume that all the queued calls will complete
 *   within the current microtask
 * - The only way that a call will encounter another call in the queue
 *   would be if the call at the front of the queue initiated this call
 *   as part of its synchronous execution
 */
function orderedQueueOperation<TArgs extends any[]>(operation: (...args: TArgs) => void) {
  const callsQueue: TArgs[] = [];
  let busyPushingNext = false;
  return function callOperation(...args: TArgs) {
    if (busyPushingNext) {
      callsQueue.unshift(args);
      return;
    }
    busyPushingNext = true;
    operation(...args);
    while (callsQueue.length > 0) {
      const nextCallArgs = callsQueue.pop();
      nextCallArgs && operation(...nextCallArgs);
    }
    busyPushingNext = false;
  };
}

/**
 * Custom Subject that ensures that subscribers are notified of values in the order that they arrived.
 * A standard Subject does not have this guarantee.
 * For example, given the following code:
 * ```typescript
 *   const subject = new Subject<string>();
     subject.subscribe(value => {
       if (value === 'start') subject.next('end');
     });
     subject.subscribe(value => { });
     subject.next('start');
 * ```
 * When `subject` is a standard `Subject<T>` the second subscriber would recieve `end` and then `start`.
 * When `subject` is a `OrderedSubject<T>` the second subscriber would recieve `start` and then `end`.
 */
export class OrderedSubject<T> extends Subject<T> {
  private _orderedNext = orderedQueueOperation((value?: T) => super.next(value));

  next(value?: T): void {
    this._orderedNext(value);
  }
}

/**
 * Custom BehaviorSubject that ensures that subscribers are notified of values in the order that they arrived.
 * A standard BehaviorSubject does not have this guarantee.
 * For example, given the following code:
 * ```typescript
 *   const subject = new BehaviorSubject<string>();
     subject.subscribe(value => {
       if (value === 'start') subject.next('end');
     });
     subject.subscribe(value => { });
     subject.next('start');
 * ```
 * When `subject` is a standard `BehaviorSubject<T>` the second subscriber would recieve `end` and then `start`.
 * When `subject` is a `OrderedBehaviorSubject<T>` the second subscriber would recieve `start` and then `end`.
 */
export class OrderedBehaviorSubject<T> extends BehaviorSubject<T> {
  private _orderedNext = orderedQueueOperation((value: T) => super.next(value));
  private _currentValue: T;

  constructor(value: T) {
    super(value);
    this._currentValue = value;
  }

  getValue(): T {
    return this._currentValue;
  }

  next(value: T): void {
    this._currentValue = value;
    this._orderedNext(value);
  }
}
