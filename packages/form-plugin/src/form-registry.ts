import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

export interface FormResetResult {
  value: any;
  dirty: boolean;
  status: string;
  errors: ValidationErrors | null;
}

type FormResetFn = (value: any) => FormResetResult;

/**
 * Lets the plugin reset bound `ngxsForm` directives synchronously while it handles
 * `ResetForm`. Waiting on `ofActionDispatched(ResetForm)` isn't enough: when
 * `ResetForm` is dispatched from inside another action handler, the `Dispatched`
 * notification is queued and may only reach the directive after `ResetForm` has
 * completed, so the form reset would clobber state set after the dispatch.
 * See https://github.com/ngxs/store/issues/2091.
 */
@Injectable({ providedIn: 'root' })
export class InternalFormRegistry {
  private readonly _resetFns = new Map<string, Set<FormResetFn>>();

  register(path: string, resetFn: FormResetFn): () => void {
    let resetFns = this._resetFns.get(path);
    if (!resetFns) {
      resetFns = new Set();
      this._resetFns.set(path, resetFns);
    }
    resetFns.add(resetFn);

    return () => {
      resetFns.delete(resetFn);
      if (resetFns.size === 0) {
        this._resetFns.delete(path);
      }
    };
  }

  /**
   * Resets every form bound to `path` and returns the resulting form state,
   * or `null` if no form is bound to `path`.
   */
  reset(path: string, value: any): FormResetResult | null {
    let result: FormResetResult | null = null;
    this._resetFns.get(path)?.forEach(resetFn => (result = resetFn(value)));
    return result;
  }
}
