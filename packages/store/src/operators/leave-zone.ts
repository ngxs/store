import { NgZone } from '@angular/core';

import {
  MonoTypeOperatorFunction,
  Observable,
  Operator,
  Subscriber,
  Subscription
} from 'rxjs';

export function leaveZone<T>(zone: NgZone): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => source.lift(new LeaveZoneOperator<T>(zone));
}

class LeaveZoneOperator<T> implements Operator<T, T> {
  constructor(private zone: NgZone) {}

  public call(subscriber: Subscriber<T>, source: Observable<T>): Subscription {
    return source.subscribe(new LeaveZoneSubscriber(subscriber, this.zone));
  }
}

class LeaveZoneSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>, private zone: NgZone) {
    super(destination);
  }

  public next(value: T): void {
    this.zone.runOutsideAngular(() => this.destination.next!(value));
  }

  public error(error: any): void {
    this.zone.runOutsideAngular(() => this.destination.error!(error));
  }

  public complete(): void {
    this.zone.runOutsideAngular(() => this.destination.complete!());
  }
}
