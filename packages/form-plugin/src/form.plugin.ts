import { Injectable } from '@angular/core';
import {
  NgxsPlugin,
  setValue,
  getActionTypeFromInstance,
  NgxsNextPluginFn
} from '@ngxs/store';
import { Observable } from 'rxjs';

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
  handle(state: any, action: any, next: NgxsNextPluginFn): Observable<any> {
    const type = getActionTypeFromInstance(action);

    let nextState = state;

    if (type === UpdateFormValue.type || type === UpdateForm.type) {
      const { value } = action.payload;
      const payloadValue = Array.isArray(value) ? value.slice() : { ...value };
      const path = this.joinPathWithPropertyPath(action);
      nextState = setValue(nextState, path, payloadValue);
    }

    if (type === UpdateFormStatus.type || type === UpdateForm.type) {
      nextState = setValue(nextState, `${action.payload.path}.status`, action.payload.status);
    }

    if (type === UpdateFormErrors.type || type === UpdateForm.type) {
      nextState = setValue(nextState, `${action.payload.path}.errors`, {
        ...action.payload.errors
      });
    }

    if (type === UpdateFormDirty.type || type === UpdateForm.type) {
      nextState = setValue(nextState, `${action.payload.path}.dirty`, action.payload.dirty);
    }

    if (type === SetFormDirty.type) {
      nextState = setValue(nextState, `${action.payload}.dirty`, true);
    }

    if (type === SetFormPristine.type) {
      nextState = setValue(nextState, `${action.payload}.dirty`, false);
    }

    if (type === SetFormDisabled.type) {
      nextState = setValue(nextState, `${action.payload}.disabled`, true);
    }

    if (type === SetFormEnabled.type) {
      nextState = setValue(nextState, `${action.payload}.disabled`, false);
    }

    return next(nextState, action);
  }

  private joinPathWithPropertyPath({ payload }: UpdateFormValue): string {
    let path = `${payload.path}.model`;

    if (payload.propertyPath) {
      path += `.${payload.propertyPath}`;
    }

    return path;
  }
}
