import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ObjectKeyMap } from '@ngxs/store/internals';

/**
 * BehaviorSubject of the entire state.
 * @ignore
 */
@Injectable()
export class StateStream extends BehaviorSubject<ObjectKeyMap<any>> {
  constructor() {
    super({});
  }
}
