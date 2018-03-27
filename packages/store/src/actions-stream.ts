import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Action stream that is emitted anytime an action is dispatched.
 *
 * You can listen to this in services to react without stores.
 */
@Injectable()
export class Actions extends Subject<any> {
  constructor(
    @Optional()
    @SkipSelf()
    parent: Actions
  ) {
    super();

    if (parent) {
      Object.assign(this, parent);
    }
  }
}
