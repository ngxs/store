import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

/**
 * BehaviorSubject of the entire state.
 */
@Injectable()
export class StateStream extends BehaviorSubject<any> {
  constructor() {
    super({});
  }
}
