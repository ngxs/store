import { NgZone } from '@angular/core';

import {
  MonoTypeOperatorFunction,
  Observable,
  Operator,
  Subscriber,
  Subscription
} from 'rxjs';

/**
 * Returns operator based on the provided condition `outsideZone`, that will run
 * `subscribe` inside or outside Angular's zone
 */
export function wrap<T>(outsideZone: boolean, zone: NgZone): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => source.lift(new WrapOperator(outsideZone, zone));
}

class WrapOperator<T> implements Operator<T, T> {
  constructor(private outsideZone: boolean, private zone: NgZone) {}

  public call(subscriber: Subscriber<T>, source: Observable<T>): Subscription {
    return source.subscribe(new WrapSubscriber(subscriber, this.outsideZone, this.zone));
  }
}

class WrapSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>, private outsideZone: boolean, private zone: NgZone) {
    super(destination);
  }

  public next(value: T): void {
    this.invoke(() => this.destination.next!(value));
  }

  public error(error: any): void {
    this.invoke(() => this.destination.error!(error));
  }

  public complete(): void {
    this.invoke(() => this.destination.complete!());
  }

  private invoke(callback: (...args: any[]) => void): void {
    if (this.outsideZone) {
      this.zone.runOutsideAngular(callback);
    } else {
      this.zone.run(callback);
    }
  }
}
