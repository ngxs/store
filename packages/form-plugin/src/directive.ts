import { Directive, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroupDirective, FormGroup } from '@angular/forms';
import { Store, getValue } from '@ngxs/store';
import { Subject, merge, pipe, iif, of } from 'rxjs';
import { takeUntil, debounceTime, filter, tap, mergeMap, finalize, map } from 'rxjs/operators';

import {
  UpdateFormStatus,
  UpdateFormValue,
  UpdateFormDirty,
  UpdateFormErrors,
  UpdateForm
} from './actions';
import { AvailableControlStatus, AvailableControlMethod, AvailableStream } from './internals';

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
    this.setupModelChangeListener();
    this.synchronizeStateWithForm();
    this.setupStatusStreamsListeners();
    this.setupValueAndStatusChangesListener();
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

  private get control(): FormGroup {
    return this._formGroupDirective.control;
  }

  private get form(): FormGroup {
    return this._formGroupDirective.form;
  }

  private setupModelChangeListener(): void {
    this._store
      .select(state => getValue(state, `${this.path}.model`))
      .pipe(
        filter(model => !this._updating && model),
        takeUntil(this._destroy$)
      )
      .subscribe(model => {
        this.form.patchValue(model);
        this._cd.markForCheck();
      });
  }

  private synchronizeStateWithForm(): void {
    this._store
      .selectOnce(state => getValue(state, `${this.path}`))
      .pipe(
        map(() => ({
          path: this.path,
          value: this.form.getRawValue(),
          status: this.form.status,
          dirty: this.form.dirty
        }))
      )
      .subscribe(({ path, value, status, dirty }) => {
        this._store.dispatch([
          new UpdateFormValue({ path, value }),
          new UpdateFormStatus({ path, status }),
          new UpdateFormDirty({ path, dirty })
        ]);
      });
  }

  private setupStatusStreamsListeners(): void {
    const getStatusStream = (
      path: string,
      key: AvailableControlStatus,
      trueMethod: AvailableControlMethod,
      elseMethod: AvailableControlMethod
    ) =>
      this._store
        .select(state => getValue(state, path))
        .pipe(map((status: boolean | null) => ({ status, key, trueMethod, elseMethod })));

    // Behavior of handling these 2 streams is the same
    // thus we should not listen these streams separately
    merge(
      getStatusStream(
        `${this.path}.dirty`,
        AvailableControlStatus.Dirty,
        AvailableControlMethod.MarkAsDirty,
        AvailableControlMethod.MarkAsPristine
      ),
      getStatusStream(
        `${this.path}.disabled`,
        AvailableControlStatus.Disabled,
        AvailableControlMethod.Disable,
        AvailableControlMethod.Enable
      )
    )
      .pipe(
        // Status can be any type, e.g. `null`
        // we have to be sure that it's type of boolean
        filter(({ status, key }) => typeof status === 'boolean' && this.form[key] !== status),
        takeUntil(this._destroy$)
      )
      .subscribe(({ status, trueMethod, elseMethod }) => {
        // Have to cast for Angular's metadata collector
        if (status) {
          (this.form[trueMethod] as Function)();
        } else {
          (this.form[elseMethod] as Function)();
        }

        this._cd.markForCheck();
      });
  }

  private setupValueAndStatusChangesListener(): void {
    const { valueChanges, statusChanges } = this._formGroupDirective;

    const mapChangesStream = (type: AvailableStream) =>
      pipe(
        debounceTime(this.debounce),
        map((statusOrValue: any) => ({ statusOrValue, type }))
      );

    // No need to listen these streams separately
    // it's easier to map to the `iif` stream, this will cost
    // less memory
    merge(
      valueChanges!.pipe(mapChangesStream(AvailableStream.ValueChanges)),
      statusChanges!.pipe(mapChangesStream(AvailableStream.StatusChanges))
    )
      .pipe(
        mergeMap(({ type, statusOrValue }) =>
          iif(
            () => type === AvailableStream.StatusChanges,
            // If event has been emitted by the `statusChanges` stream
            this.handleStatusChanges(statusOrValue),
            // If event has been emitted by the `valueChanges` stream
            this.handleValueChanges()
          )
        ),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  private handleStatusChanges(status: string) {
    return this._store.dispatch(new UpdateFormStatus({ status, path: this.path }));
  }

  private handleValueChanges() {
    return of(this.control.getRawValue()).pipe(
      tap(() => (this._updating = true)),
      mergeMap(value => {
        const { path } = this;
        return this._store
          .dispatch([
            new UpdateFormValue({ path, value }),
            new UpdateFormDirty({ path, dirty: this._formGroupDirective.dirty }),
            new UpdateFormErrors({ path, errors: this._formGroupDirective.errors })
          ])
          .pipe(finalize(() => (this._updating = false)));
      })
    );
  }
}
