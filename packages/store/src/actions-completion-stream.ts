import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Internal Action stream that is emitted anytime an action is completed.
 */
@Injectable()
export class InternalActionCompletions extends Subject<any> {}

/**
 * Action stream that is emitted anytime an action is completed.
 *
 * You can listen to this in services to react without stores.
 */
@Injectable()
export class ActionCompletions extends Observable<any> {
  private _stream: InternalActionCompletions;

  constructor() {
    super();
    this._stream = new InternalActionCompletions();
  }

  subscribe(fn?) {
    return this._stream.subscribe(fn);
  }
}
