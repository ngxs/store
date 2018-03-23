import { Injectable } from "@angular/core";
import { NgxsPlugin } from "../../symbols";
import { getTypeFromInstance, setValue } from "../../internals";

@Injectable()
export class NgxsFormPlugin implements NgxsPlugin {
  constructor() {}

  handle(state, event, next) {
    const type = getTypeFromInstance(event);

    let nextState = state;

    if (type === "UpdateFormValue" || type === "UpdateForm") {
      nextState = setValue(nextState, `${event.payload.path}.model`, {
        ...event.payload.value
      });
    }

    if (type === "UpdateFormStatus" || type === "UpdateForm") {
      nextState = setValue(
        nextState,
        `${event.payload.path}.status`,
        event.payload.status
      );
    }

    if (type === "UpdateFormErrors" || type === "UpdateForm") {
      nextState = setValue(nextState, `${event.payload.path}.errors`, {
        ...event.payload.errors
      });
    }

    if (type === "UpdateFormDirty" || type === "UpdateForm") {
      nextState = setValue(
        nextState,
        `${event.payload.path}.dirty`,
        event.payload.dirty
      );
    }

    if (type === "SetFormDirty") {
      nextState = setValue(nextState, `${event.payload}.dirty`, true);
    }

    if (type === "SetFormPrestine") {
      nextState = setValue(nextState, `${event.payload}.dirty`, false);
    }

    if (type === "SetFormDisabled") {
      nextState = setValue(nextState, `${event.payload}.disabled`, true);
    }

    if (type === "SetFormEnabled") {
      nextState = setValue(nextState, `${event.payload}.disabled`, false);
    }

    return next(nextState, event);
  }
}
