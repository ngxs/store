import { Directive, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { Store, getValue } from '@ngxs/store';
import { Subject } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  mergeMap,
  finalize
} from 'rxjs/operators';
import {
  UpdateFormStatus,
  UpdateFormValue,
  UpdateFormDirty,
  UpdateFormErrors,
  UpdateForm
} from './actions';

@Directive({ selector: '[ngxsForm]' })
export class FormDirective implements OnInit, OnDestroy {
  @Input('ngxsForm') path: string;
  @Input('ngxsFormDebounce') debounce = 100;
  @Input('ngxsFormClearOnDestroy') clearDestroy = false;

  private _destroy$ = new Subject<void>();
  private _updating = false;

  constructor(
    private _store: Store,
    private _formGroupDirective: FormGroupDirective,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._store
      .select(state => getValue(state, `${this.path}.model`))
      .pipe(takeUntil(this._destroy$))
      .subscribe(model => {
        if (this._updating || !model) {
          return;
        }

        this._formGroupDirective.form.patchValue(model);
        this._cd.markForCheck();
      });

    // On first state change, sync form model, status and dirty with state
    this._store
      .selectOnce(state => getValue(state, `${this.path}`))
      .subscribe(() => {
        this._store.dispatch([
          new UpdateFormValue({
            path: this.path,
            value: this._formGroupDirective.form.getRawValue()
          }),
          new UpdateFormStatus({
            path: this.path,
            status: this._formGroupDirective.form.status
          }),
          new UpdateFormDirty({
            path: this.path,
            dirty: this._formGroupDirective.form.dirty
          })
        ]);
      });

    this._store
      .select(state => getValue(state, `${this.path}.dirty`))
      .pipe(takeUntil(this._destroy$))
      .subscribe(dirty => {
        if (this._formGroupDirective.form.dirty === dirty || typeof dirty !== 'boolean') {
          return;
        }

        if (dirty) {
          this._formGroupDirective.form.markAsDirty();
          this._cd.markForCheck();
        } else {
          this._formGroupDirective.form.markAsPristine();
          this._cd.markForCheck();
        }
      });

    this._store
      .select(state => getValue(state, `${this.path}.disabled`))
      .pipe(takeUntil(this._destroy$))
      .subscribe(disabled => {
        if (
          this._formGroupDirective.form.disabled === disabled ||
          typeof disabled !== 'boolean'
        ) {
          return;
        }

        if (disabled) {
          this._formGroupDirective.form.disable();
          this._cd.markForCheck();
        } else if (disabled) {
          this._formGroupDirective.form.enable();
          this._cd.markForCheck();
        }
      });

    this._formGroupDirective
      .valueChanges!.pipe(
        debounceTime(this.debounce),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntil(this._destroy$),
        mergeMap(() => {
          const value = this._formGroupDirective.control.getRawValue();
          this._updating = true;
          return this._store
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
            .pipe(finalize(() => (this._updating = false)));
        })
      )
      .subscribe();

    this._formGroupDirective
      .statusChanges!.pipe(
        debounceTime(this.debounce),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
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
}
