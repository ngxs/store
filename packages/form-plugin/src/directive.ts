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
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { getValue } from '@ngxs/store/plugins';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';

import {
  ResetForm,
  UpdateForm,
  UpdateFormDirty,
  UpdateFormErrors,
  UpdateFormStatus,
  UpdateFormValue
} from './actions';

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

  private _actions$ = inject(Actions);
  private _store = inject(Store);
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
    const resetForm$ = this._actions$.pipe(
      ofActionDispatched(ResetForm),
      takeUntilDestroyed(this._destroyRef)
    );

    resetForm$.subscribe((action: ResetForm) => {
      if (action.payload.path !== this.path) {
        return;
      }

      this.form.reset(action.payload.value);
      this.updateFormStateWithRawValue(true);
      this._cd.markForCheck();
    });

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
