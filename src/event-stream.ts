import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class EventStream extends BehaviorSubject<any> {
  constructor() {
    super({});
  }
}
