import { NgZone } from '@angular/core';

import {
  MonoTypeOperatorFunction,
  Observable,
  Operator,
  Subscriber,
  Subscription
} from 'rxjs';

export function enterZone<T>(zone: NgZone): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => source.lift(new EnterZoneOperator<T>(zone));
}

class EnterZoneOperator<T> implements Operator<T, T> {
  constructor(private zone: NgZone) {}

  public call(subscriber: Subscriber<T>, source: Observable<T>): Subscription {
    return source.subscribe(new EnterZoneSubscriber(subscriber, this.zone));
  }
}

class EnterZoneSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>, private zone: NgZone) {
    super(destination);
  }

  public next(value: T): void {
    this.zone.run(() => this.destination.next!(value));
  }

  public error(error: any): void {
    this.zone.run(() => this.destination.error!(error));
  }

  public complete(): void {
    this.zone.run(() => this.destination.complete!());
  }
}
