import { Injectable, Optional, SkipSelf } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

/**
 * BehaviorSubject of the entire state.
 */
@Injectable()
export class StateStream extends BehaviorSubject<any> {
  constructor(
    @Optional()
    @SkipSelf()
    parent: StateStream
  ) {
    super({});

    if (parent) {
      Object.assign(this, parent);
    }
  }
}
