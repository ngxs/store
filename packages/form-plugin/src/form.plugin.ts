import { Injectable } from '@angular/core';
import { NgxsPlugin, setValue, getActionTypeFromInstance } from '@ngxs/store';

@Injectable()
export class NgxsFormPlugin implements NgxsPlugin {
  constructor() {}

  handle(state, event, next) {
    const type = getActionTypeFromInstance(event);

    let nextState = state;

    if (type === '[Forms] Update Form Value' || type === '[Forms] Update Form') {
      nextState = setValue(nextState, `${event.payload.path}.model`, {
        ...event.payload.value
      });
    }

    if (type === '[Forms] Update Form Status' || type === '[Forms] Update Form') {
      nextState = setValue(nextState, `${event.payload.path}.status`, event.payload.status);
    }

    if (type === '[Forms] Update Form Errors' || type === '[Forms] Update Form') {
      nextState = setValue(nextState, `${event.payload.path}.errors`, {
        ...event.payload.errors
      });
    }

    if (type === '[Forms] Update Form Dirty' || type === '[Forms] Update Form') {
      nextState = setValue(nextState, `${event.payload.path}.dirty`, event.payload.dirty);
    }

    if (type === '[Forms] Set Form Dirty') {
      nextState = setValue(nextState, `${event.payload}.dirty`, true);
    }

    if (type === '[Forms] Set Form Pristine') {
      nextState = setValue(nextState, `${event.payload}.dirty`, false);
    }

    if (type === '[Forms] Set Form Disabled') {
      nextState = setValue(nextState, `${event.payload}.disabled`, true);
    }

    if (type === '[Forms] Set Form Enabled') {
      nextState = setValue(nextState, `${event.payload}.disabled`, false);
    }

    return next(nextState, event);
  }
}
