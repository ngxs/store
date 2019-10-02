import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PlainObject } from '@ngxs/store/internals';

/**
 * BehaviorSubject of the entire state.
 * @ignore
 */
@Injectable()
export class StateStream extends BehaviorSubject<PlainObject> {
  constructor() {
    super({});
  }
}
