import { Injectable } from '@angular/core';
import { ɵStateStream } from '@ngxs/store/internals';

/**
 * @deprecated use `ɵStateStream` from `@ngxs/store/internals`.
 */
@Injectable({ providedIn: 'root' })
export class StateStream extends ɵStateStream {}
