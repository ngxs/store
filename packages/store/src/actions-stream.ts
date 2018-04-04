import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

/**
 * Action stream that is emitted anytime an action is dispatched.
 *
 * You can listen to this in services to react without stores.
 */
@Injectable()
export class Actions extends Subject<any> {}
