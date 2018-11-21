import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * BehaviorSubject of the entire state.
 * @ignore
 */
@Injectable()
export class StateStream extends BehaviorSubject<any> {
  constructor() {
    super({} as any);
  }
}
