import { Injectable } from '@angular/core';
import {
  NgxsPlugin,
  setValue,
  getActionTypeFromInstance,
  NgxsNextPluginFn
} from '@ngxs/store';
import {
  UpdateForm,
  UpdateFormDirty,
  UpdateFormErrors,
  UpdateFormStatus,
  UpdateFormValue,
  SetFormDirty,
  SetFormDisabled,
  SetFormEnabled,
  SetFormPristine,
  UpdateFormArrayValue
} from './actions';

@Injectable()
export class NgxsFormPlugin implements NgxsPlugin {
  handle(state: any, event: any, next: NgxsNextPluginFn) {
    const type = getActionTypeFromInstance(event);

    let nextState = state;

    if (type === UpdateFormValue.type || type === UpdateForm.type) {
      // Don't wrap it with `retrieveImmutably` as it can be a breaking change
      const value = Array.isArray(event.payload.value)
        ? event.payload.value.slice()
        : { ...event.payload.value };
      nextState = setValue(nextState, `${event.payload.path}.model`, value);
    }

    if (type === UpdateFormArrayValue.type) {
      const value = this.retrieveImmutably(event.payload.value);

      nextState = setValue(
        nextState,
        `${event.payload.path}.model.${event.payload.arrayPath}`,
        value
      );
    }

    if (type === UpdateFormStatus.type || type === UpdateForm.type) {
      nextState = setValue(nextState, `${event.payload.path}.status`, event.payload.status);
    }

    if (type === UpdateFormErrors.type || type === UpdateForm.type) {
      nextState = setValue(nextState, `${event.payload.path}.errors`, {
        ...event.payload.errors
      });
    }

    if (type === UpdateFormDirty.type || type === UpdateForm.type) {
      nextState = setValue(nextState, `${event.payload.path}.dirty`, event.payload.dirty);
    }

    if (type === SetFormDirty.type) {
      nextState = setValue(nextState, `${event.payload}.dirty`, true);
    }

    if (type === SetFormPristine.type) {
      nextState = setValue(nextState, `${event.payload}.dirty`, false);
    }

    if (type === SetFormDisabled.type) {
      nextState = setValue(nextState, `${event.payload}.disabled`, true);
    }

    if (type === SetFormEnabled.type) {
      nextState = setValue(nextState, `${event.payload}.disabled`, false);
    }

    return next(nextState, event);
  }

  /**
   * Value can be also a plain string, number or anything else
   */
  private retrieveImmutably(value: any) {
    if (this.isPrimitive(value)) {
      return value;
    }

    return Array.isArray(value) ? value.slice() : { ...value };
  }

  /**
   * This is 30x faster than `value !== Object(value)`
   */
  private isPrimitive(value: any) {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'symbol' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint' ||
      value == null
    );
  }
}
