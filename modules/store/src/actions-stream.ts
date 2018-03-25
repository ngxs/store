import { Injectable, Optional, SkipSelf } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

/**
 * Action stream that is emitted anytime an action is dispatched.
 * You can listen to this in services to react without stores.
 */
@Injectable()
export class Actions extends BehaviorSubject<any> {
  constructor(
    @Optional()
    @SkipSelf()
    parent: Actions
  ) {
    super({});

    if (parent) {
      Object.assign(this, parent);
    }
  }
}
