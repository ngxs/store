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
  SetFormPristine
} from './actions';

@Injectable()
export class NgxsFormPlugin implements NgxsPlugin {
  handle(state: any, event: any, next: NgxsNextPluginFn) {
    const type = getActionTypeFromInstance(event);

    let nextState = state;

    if (type === UpdateFormValue.type || type === UpdateForm.type) {
      const value = this.retrieveImmutably(event.payload.value);
      const path = this.getUpdateFormValuePath(event);
      nextState = setValue(nextState, path, value);
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

  private getUpdateFormValuePath({ payload }: UpdateFormValue) {
    let path = `${payload.path}.model`;

    if (payload.propertyPath) {
      path += `.${payload.propertyPath}`;
    }

    return path;
  }

  private retrieveImmutably(value: any) {
    if (Array.isArray(value)) {
      return value.slice();
    }

    if (value !== null && typeof value === 'object') {
      return { ...value };
    }

    // Means it's a primitive value like single string or number
    return value;
  }
}
