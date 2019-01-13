import { Directive, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroupDirective, FormGroup } from '@angular/forms';
import { Store, getValue } from '@ngxs/store';
import { Subject, pipe, UnaryFunction } from 'rxjs';
import { takeUntil, debounceTime, filter, tap, mergeMap, finalize, map } from 'rxjs/operators';

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
      .pipe(
        filter(model => !this._updating && model),
        takeUntil(this._destroy$)
      )
      .subscribe(model => {
        this._formGroupDirective.form.patchValue(model);
        this._cd.markForCheck();
      });

    // On first state change, sync form model, status and dirty with state
    this._store
      .selectOnce(state => getValue(state, `${this.path}`))
      .subscribe(() => {
        const { path } = this;
        this._store.dispatch([
          new UpdateFormValue({
            path,
            value: this._formGroupDirective.form.getRawValue()
          }),
          new UpdateFormStatus({
            path,
            status: this._formGroupDirective.form.status
          }),
          new UpdateFormDirty({
            path,
            dirty: this._formGroupDirective.form.dirty
          })
        ]);
      });

    this._store
      .select(state => getValue(state, `${this.path}.dirty`))
      .pipe<boolean>(this.filterStatus('dirty'))
      .subscribe((dirty: boolean) => {
        this.updateForm(
          dirty,
          () => this._formGroupDirective.form.markAsDirty(),
          () => this._formGroupDirective.form.markAsPristine()
        );
      });

    this._store
      .select(state => getValue(state, `${this.path}.disabled`))
      .pipe<boolean>(this.filterStatus('disabled'))
      .subscribe((disabled: boolean) => {
        this.updateForm(
          disabled,
          () => this._formGroupDirective.form.disable(),
          () => this._formGroupDirective.form.enable()
        );
      });

    this._formGroupDirective
      .valueChanges!.pipe(
        debounceTime(this.debounce),
        tap(() => (this._updating = true)),
        map(() => this._formGroupDirective.control.getRawValue()),
        mergeMap(value => {
          const { path } = this;
          return this._store
            .dispatch([
              new UpdateFormValue({ path, value }),
              new UpdateFormDirty({ path, dirty: this._formGroupDirective.dirty }),
              new UpdateFormErrors({ path, errors: this._formGroupDirective.errors })
            ])
            .pipe(finalize(() => (this._updating = false)));
        }),
        takeUntil(this._destroy$)
      )
      .subscribe();

    this._formGroupDirective
      .statusChanges!.pipe(
        debounceTime(this.debounce),
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

    if (!this.clearDestroy) {
      return;
    }

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

  private filterStatus = (
    key: Extract<keyof FormGroup, 'disabled' | 'dirty'>
  ): UnaryFunction<any, any> => {
    return pipe(
      filter(
        (status: boolean | null) =>
          typeof status === 'boolean' && this._formGroupDirective.form[key] !== status
      ),
      takeUntil(this._destroy$)
    );
  };

  private updateForm(status: boolean, trueCallback: Function, elseCallback: Function) {
    if (status) {
      trueCallback();
    } else {
      elseCallback();
    }

    this._cd.markForCheck();
  }
}
