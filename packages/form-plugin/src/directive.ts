import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { Actions, getValue, ofActionDispatched, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import {
  ResetForm,
  UpdateForm,
  UpdateFormDirty,
  UpdateFormErrors,
  UpdateFormStatus,
  UpdateFormValue
} from './actions';

@Directive({ selector: '[ngxsForm]' })
export class FormDirective implements OnInit, OnDestroy {
  @Input('ngxsForm')
  path: string = null!;

  @Input('ngxsFormDebounce')
  debounce = 100;

  @Input('ngxsFormClearOnDestroy')
  clearDestroy = false;

  private readonly _destroy$ = new Subject<void>();
  private _updating = false;

  constructor(
    private _actions$: Actions,
    private _store: Store,
    private _formGroupDirective: FormGroupDirective,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._actions$
      .pipe(
        ofActionDispatched(ResetForm),
        filter((action: ResetForm) => action.payload.path === this.path),
        takeUntil(this._destroy$)
      )
      .subscribe(({ payload: { value } }: ResetForm) => {
        this.form.reset(value);
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

    this._formGroupDirective.valueChanges!.pipe(this.debounceChange()).subscribe(() => {
      const value = this._formGroupDirective.control.getRawValue();
      this._updating = true;
      this._store
        .dispatch([
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
        ])
        .subscribe({
          error: () => (this._updating = false),
          complete: () => (this._updating = false)
        });
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

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();

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
  }

  private debounceChange() {
    const skipDebounceTime =
      this._formGroupDirective.control.updateOn !== 'change' || this.debounce < 0;

    return skipDebounceTime
      ? (change: Observable<any>) => change.pipe(takeUntil(this._destroy$))
      : (change: Observable<any>) =>
          change.pipe(debounceTime(this.debounce), takeUntil(this._destroy$));
  }

  private get form(): FormGroup {
    return this._formGroupDirective.form;
  }

  private getStateStream(path: string) {
    return this._store.select(state => getValue(state, path)).pipe(takeUntil(this._destroy$));
  }
}
