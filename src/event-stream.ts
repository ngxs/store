import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

/**
 * Event stream that is emitted anytime an event is dispatched.
 * You can listen to this in services to react without stores.
 */
@Injectable()
export class EventStream extends BehaviorSubject<any> {
  constructor() {
    super({});
  }
}
