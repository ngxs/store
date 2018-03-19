import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

/**
 * Action stream that is emitted anytime an action is dispatched.
 * You can listen to this in services to react without stores.
 */
@Injectable()
export class Actions extends BehaviorSubject<any> {
  constructor() {
    super({});
  }
}
