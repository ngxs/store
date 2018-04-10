import { Injectable, Optional, SkipSelf } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * BehaviorSubject of the entire state.
 */
@Injectable()
export class StateStream extends BehaviorSubject<any> {
  constructor() {
    super({});
  }
}
