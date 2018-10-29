import { Type } from '@angular/core';

export type NgxsStateType = Type<unknown>;

export enum NgxsProvidedIn {
  root = 'ngxsRoot',
  feature = 'ngxsFeature'
}

export interface NgxsProvides {
  ngxsRoot: NgxsStateType[];
  ngxsFeature: NgxsStateType[];
}
