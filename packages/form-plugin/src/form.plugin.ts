import { inject, Injectable } from '@angular/core';
import {
  getActionTypeFromInstance,
  getValue,
  NgxsNextPluginFn,
  NgxsPlugin,
  setValue
} from '@ngxs/store/plugins';
import {
  ResetForm,
  SetFormDirty,
  SetFormDisabled,
  SetFormEnabled,
  SetFormPristine,
  UpdateForm,
  UpdateFormDirty,
  UpdateFormErrors,
  UpdateFormStatus,
  UpdateFormValue
} from './actions';
import { InternalFormRegistry } from './form-registry';

@Injectable()
export class NgxsFormPlugin implements NgxsPlugin {
  private _formRegistry = inject(InternalFormRegistry);

  handle(state: any, event: any, next: NgxsNextPluginFn) {
    const type = getActionTypeFromInstance(event);

    let nextState = state;

    if (type === UpdateFormValue.type || type === UpdateForm.type || type === ResetForm.type) {
      const { value } = event.payload;
      const payloadValue = Array.isArray(value)
        ? value.slice()
        : isObjectLike(value)
          ? { ...value }
          : value;
      const path = this.joinPathWithPropertyPath(event);
      nextState = setValue(nextState, path, payloadValue);
    }

    if (type === ResetForm.type) {
      const form = this._formRegistry.reset(event.payload.path, event.payload.value);

      if (form) {
        nextState = setValue(nextState, `${event.payload.path}`, {
          model: form.value,
          dirty: form.dirty,
          status: form.status,
          errors: { ...form.errors }
        });
      } else {
        const model = getValue(nextState, `${event.payload.path}.model`);
        nextState = setValue(nextState, `${event.payload.path}`, { model: model });
      }
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

  private joinPathWithPropertyPath({ payload }: UpdateFormValue): string {
    let path = `${payload.path}.model`;

    if (payload.propertyPath) {
      path += `.${payload.propertyPath}`;
    }

    return path;
  }
}

function isObjectLike(target: unknown): target is object {
  return target !== null && typeof target === 'object';
}
