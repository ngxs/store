import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReducerFactory } from './reducer-factory';

@Injectable()
export class ActionStream extends BehaviorSubject<any> {
  constructor(reducerFactory: ReducerFactory) {
    super({});
  }
}
