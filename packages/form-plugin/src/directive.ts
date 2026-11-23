import {
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  inject,
  Input,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { Store } from '@ngxs/store';
import { getValue } from '@ngxs/store/plugins';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';

import {
  UpdateForm,
  UpdateFormDirty,
  UpdateFormErrors,
  UpdateFormStatus,
  UpdateFormValue
} from './actions';
import { InternalFormRegistry } from './form-registry';

@Directive({ selector: '[ngxsForm]', standalone: true })
export class NgxsFormDirective implements OnInit {
  @Input('ngxsForm')
  path: string = null!;

  @Input('ngxsFormDebounce')
  set debounce(debounce: string | number) {
    this._debounce = Number(debounce);
  }
  get debounce() {
    return this._debounce;
  }
  private _debounce = 100;

  @Input('ngxsFormClearOnDestroy')
  set clearDestroy(val: boolean) {
    this._clearDestroy = val != null && `${val}` !== 'false';
  }
  get clearDestroy(): boolean {
    return this._clearDestroy;
  }
  private _clearDestroy = false;

  private _updating = false;

  private _store = inject(Store);
  private _formRegistry = inject(InternalFormRegistry);
  private _formGroupDirective = inject(FormGroupDirective);
  private _cd = inject(ChangeDetectorRef);

  private readonly _destroyRef = inject(DestroyRef);

  constructor() {
    this._destroyRef.onDestroy(() => {
      if (this.clearDestroy) {
        this._store.dispatch(
          new UpdateForm({
            path: this.path,
            value: null,
            dirty: null,
            status: null,
            errors: null
          })
        );
      }
    });
  }

  ngOnInit() {
    // The plugin calls this synchronously while handling `ResetForm` and writes
    // the returned form state itself, so `ResetForm` only completes once the
    // form has been reset.
    const unregisterReset = this._formRegistry.register(this.path, value => {
      this._updating = true;
      try {
        this.form.reset(value);
      } finally {
        this._updating = false;
      }
      this._cd.markForCheck();

      return {
        value: this.form.getRawValue(),
        dirty: this.form.dirty,
        status: this.form.status,
        errors: this.form.errors
      };
    });
    this._destroyRef.onDestroy(unregisterReset);

    this.getStateStream(`${this.path}.model`).subscribe(model => {
      if (this._updating || !model) {
        return;
      }

      this.form.patchValue(model);
      this._cd.markForCheck();
    });

    this.getStateStream(`${this.path}.dirty`).subscribe(dirty => {
      if (this.form.dirty === dirty || typeof dirty !== 'boolean') {
        return;
      }

      if (dirty) {
        this.form.markAsDirty();
      } else {
        this.form.markAsPristine();
      }

      this._cd.markForCheck();
    });

    // On first state change, sync form model, status and dirty with state
    this._store
      .selectOnce(state => getValue(state, this.path))
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._store.dispatch([
          new UpdateFormValue({
            path: this.path,
            value: this.form.getRawValue()
          }),
          new UpdateFormStatus({
            path: this.path,
            status: this.form.status
          }),
          new UpdateFormDirty({
            path: this.path,
            dirty: this.form.dirty
          })
        ]);
      });

    this.getStateStream(`${this.path}.disabled`).subscribe(disabled => {
      if (this.form.disabled === disabled || typeof disabled !== 'boolean') {
        return;
      }

      if (disabled) {
        this.form.disable();
      } else {
        this.form.enable();
      }

      this._cd.markForCheck();
    });

    this._formGroupDirective
      .valueChanges!.pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        this.debounceChange()
      )
      .subscribe(() => {
        this.updateFormStateWithRawValue();
      });

    this._formGroupDirective
      .statusChanges!.pipe(distinctUntilChanged(), this.debounceChange())
      .subscribe((status: string) => {
        this._store.dispatch(
          new UpdateFormStatus({
            status,
            path: this.path
          })
        );
      });
  }

  updateFormStateWithRawValue(withFormStatus?: boolean) {
    if (this._updating) return;

    const value = this._formGroupDirective.control.getRawValue();

    const actions: any[] = [
      new UpdateFormValue({
        path: this.path,
        value
      }),
      new UpdateFormDirty({
        path: this.path,
        dirty: this._formGroupDirective.dirty
      }),
      new UpdateFormErrors({
        path: this.path,
        errors: this._formGroupDirective.errors
      })
    ];

    if (withFormStatus) {
      actions.push(
        new UpdateFormStatus({
          path: this.path,
          status: this._formGroupDirective.status
        })
      );
    }

    this._updating = true;
    this._store.dispatch(actions).subscribe({
      error: () => (this._updating = false),
      complete: () => (this._updating = false)
    });
  }

  private debounceChange() {
    const skipDebounceTime =
      this._formGroupDirective.control.updateOn !== 'change' || this._debounce < 0;

    return skipDebounceTime
      ? (change: Observable<any>) => change.pipe(takeUntilDestroyed(this._destroyRef))
      : (change: Observable<any>) =>
          change.pipe(debounceTime(this._debounce), takeUntilDestroyed(this._destroyRef));
  }

  private get form(): FormGroup {
    return this._formGroupDirective.form;
  }

  private getStateStream(path: string) {
    return this._store
      .select(state => getValue(state, path))
      .pipe(takeUntilDestroyed(this._destroyRef));
  }
}
